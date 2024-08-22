/**
 * Error logging for the Sharetribe Web Template's server. Can be used to
 * strap on an external error logging service like Sentry
 * or just plain printing errors to the log.
 */

const Sentry = require('@sentry/node');

const ENV = process.env.VITE_ENV;
const SENTRY_DSN = process.env.VITE_SENTRY_DSN;

/**
 * Set up error loggin. If a Sentry DSN is defined
 * Sentry client is configured.
 */
exports.setup = () => {
  if (SENTRY_DSN) {
    // Configure the Sentry client. As is, this catches unhandled
    // exceptions from starting the server etc. but does not catch the
    // ones thrown from Express.js middleware functions. For those
    // an error handler has to be added to the Express app.
    Sentry.init({ dsn: SENTRY_DSN, environment: ENV });
  }

  const { error } = console;
  console.error = (...args) => {
    // Ignore useless warnings on the server
    if (/defaultProps/.test(args[0])) return;
    if (/Warning: Failed %s type: %s%s/.test(args[0])) return;
    error(...args);
  };
};

/**
 * Returns a Sentry request handler in case
 * Sentry client is set up.
 */
exports.requestHandler = () => {
  if (SENTRY_DSN) {
    return Sentry.Handlers.requestHandler();
  }
  return (req, res, next) => {
    next();
  };
};

/**
 * Returns a Sentry error handler in case
 * Sentry client is set up.
 */
exports.errorHandler = () => {
  if (SENTRY_DSN) {
    return Sentry.Handlers.errorHandler();
  }
  return (err, req, res, next) => {
    next(err);
  };
};

const responseApiErrorInfo = (err) =>
  (err?.data?.errors || []).map((e) => ({
    status: e.status,
    code: e.code,
    meta: e.meta,
  }));

/**
 * Logs a error. If Sentry client is set up
 * passes the error to that. Otherwise prints
 * the error to `console.error`.
 *
 * @param {Error} e Error that occurred
 * @param {String} code Error code
 * @param {Object} data Additional data to be sent to Sentry
 */
exports.error = (e, code, data) => {
  if (SENTRY_DSN) {
    const extra = { ...data, apiErrorData: responseApiErrorInfo(e) };

    Sentry.withScope((scope) => {
      scope.setTag('code', code);
      Object.keys(extra).forEach((key) => {
        scope.setExtra(key, extra[key]);
      });
      Sentry.captureException(e);
    });
  }
  // Let's log always to stdout
  console.error(e);
  console.error(code);
  console.error(data);
};

// eslint-disable-next-line no-console
exports.info = (...args) => console.info(...args);

exports.warn = (...args) => console.warn(...args);

// eslint-disable-next-line no-console
exports.log = (...args) => console.log(...args);

// eslint-disable-next-line no-console
exports.trace = (...args) => console.trace(...args);
