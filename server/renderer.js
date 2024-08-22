/* eslint-disable no-useless-escape */
import _omit from 'lodash/omit';
import _template from 'lodash/template';
import log from 'log';
import path from 'node:path';
import { types } from 'sharetribe-flex-sdk';
import { createCriticalStyleStream, discoverProjectStyles } from 'used-styles';

const STREAMING_TIMEOUT = 10000;
const headClosingTag = '</head>';
const rootDivOpeningTag = '<div id="root">';
const rootDivOpeningTagLength = rootDivOpeningTag.length;

const reNoMatch = /($^)/;

const templateWithHtmlAttributes = (indexHtml) =>
  _template(indexHtml, {
    interpolate: /data-htmlattr=\"([\s\S]+?)\"/g,
    evaluate: reNoMatch,
    escape: reNoMatch,
  });

const templateTags = (templatedWithHtmlAttributes) =>
  _template(templatedWithHtmlAttributes, {
    interpolate: /<!--!([\s\S]+?)-->/g,
    evaluate: reNoMatch,
    escape: reNoMatch,
  });

const template = (params, indexHtml) => {
  const { htmlAttributes } = params;
  const tags = _omit(params, ['htmlAttributes']);
  const templatedWithHtmlAttributes = templateWithHtmlAttributes(indexHtml)({ htmlAttributes });
  return templateTags(templatedWithHtmlAttributes)(tags);
};

//
// Clean Error details when stringifying Error.
//
const cleanErrorValue = (value) => {
  if (value instanceof Error) {
    const { name, message, status, statusText, apiErrors } = value;
    return { type: 'error', name, message, status, statusText, apiErrors };
  }
  return value;
};
const replacer = (key = null, value = null) => {
  const cleanedValue = cleanErrorValue(value);
  return types.replacer(key, cleanedValue);
};

// generate lookup table on server start
const stylesLookup = discoverProjectStyles(path.join(__dirname, '..', 'dist/client'), (file) => {
  // Skip the default index-[hash].css file. It's already included in the index.html
  return !file.includes('assets/index');
});

const htmlSplitter = (html) => {
  const headClosingTagIndex = html.indexOf(headClosingTag);
  const headerHtml = html.slice(0, headClosingTagIndex);
  const middleHtmlStartIndex = html.indexOf(rootDivOpeningTag) + rootDivOpeningTagLength;
  const middleHtml = html.slice(headClosingTagIndex, middleHtmlStartIndex);
  const footerHtml = html.slice(middleHtmlStartIndex);
  return { headerHtml, middleHtml, footerHtml };
};

/**
 * Renders the server-side rendered application.
 *
 * @param {Object} options - The rendering options.
 * @param {Object} options.ssrServerEntry - The server-side rendering entry point function.
 * @param {Object} options.ssrServerEntry.renderApp - The render.
 * @param {string} options.htmlMarkup - The HTML markup template.
 * @param {Object} options.res - The expressjs res object.
 * @param {Object} options.req - The expressjs req object.
 */
async function render({ ssrServerEntry, htmlMarkup, res, req }) {
  const { renderApp } = ssrServerEntry;

  const { pipe, abort, preloadedState, helmetContext } = await renderApp({
    req,
    res,
    options: {
      onShellError(error) {
        log.error('[onShellError] Error while rendering:', error);
        throw error;
      },
      // eslint-disable-next-line consistent-return
      async onShellReady() {
        res.set({ 'Content-Type': 'text/html' });
        const { helmet: head } = helmetContext;
        const serializedState = JSON.stringify(preloadedState, replacer).replace(/</g, '\\u003c');

        const preloadedStateScript = `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(serializedState)};</script>`;
        const htmlString = template(
          {
            htmlAttributes: head.htmlAttributes.toString(),
            title: head.title.toString(),
            link: head.link.toString(),
            meta: head.meta.toString(),
            script: head.script.toString(),
            preloadedStateScript,
          },
          htmlMarkup
        );

        const { footerHtml, headerHtml, middleHtml } = htmlSplitter(htmlString);

        const styledStream = createCriticalStyleStream(stylesLookup);

        // allow client to start loading js bundle
        res.write(headerHtml);

        styledStream.pipe(res, { end: false });
        res.write(middleHtml);

        // start by piping react and styled transform stream
        pipe(styledStream);

        styledStream.on('end', () => {
          res.end(footerHtml);
        });
      },
      onError(error, info) {
        log.error('[onError] Error while rendering:', error, info);
        throw error;
      },
    },
  });

  setTimeout(() => {
    abort();
  }, STREAMING_TIMEOUT);
}

export default render;
