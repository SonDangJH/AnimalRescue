import express from 'express';
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import basicAuthMiddleware from 'middlewares/basicAuth';
import log from './log';
import importer from './importer';
import { port } from './config/server';
import render from './renderer';
import expressConfig from './express-config';
import robotsTxtRoute from './resources/robotsTxt';
import sitemapResourceRoute from './resources/sitemap';
import webmanifestResourceRoute from './resources/webmanifest';
import wellKnownRouter from './wellKnownRouter';
import apiRouter from './apiRouter';

setupCache(Axios);
log.setup();

const app = express();
expressConfig(app);

const { indexHtml, serverEntry, error500HTML } = await importer({
  mode: 'production',
});

app.get('/robots.txt', robotsTxtRoute);
app.get('/sitemap-:resource', sitemapResourceRoute);
app.get('/site.webmanifest', webmanifestResourceRoute);
app.use('/.well-known', wellKnownRouter);

app.use(log.requestHandler());
app.use('/api', apiRouter);

// Serve HTML
app.get('*', basicAuthMiddleware, async (req, res) => {
  try {
    await render({
      ssrServerEntry: serverEntry,
      htmlMarkup: indexHtml,
      res,
      req,
    });
  } catch (e) {
    log.error('Error while rendering:', e);
    res.set('Content-Type', 'text/html');
    res.send(error500HTML);
  }
});

app.use(log.errorHandler());

// Start http server
app.listen(port, () => {
  log.info(`Server started at port ${port}`);
});
