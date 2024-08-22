/**
 * Logging
 *
 * Should be used to log errors to console or and eternal
 * error logging system, like Sentry for example.
 * Should also be used for logging any other information
 * In the future when we have a logging analytics system we would use that.
 *
 */

import * as Sentry from '@sentry/browser';
import appSettings from '../config/settings';

/**
 * Set up error handling. If a Sentry DSN is
 * provided a Sentry client will be installed.
 */
export const setup = () => {
  if (appSettings.sentryDsn) {
    // Configures the Sentry client. Adds a handler for
    // any uncaught exception.
    Sentry.init({
      dsn: appSettings.sentryDsn,
      environment: appSettings.env,
    });
  }
};

/**
 * Set user ID for the logger so that it
 * can be attached to Sentry issues.
 *
 * @param {String} userId ID of current user
 */
export const setUserId = (userId) => {
  Sentry.configureScope((scope) => {
    scope.setUser({ id: userId });
  });
};

/**
 * Clears the user ID.
 */

export const clearUserId = () => {
  Sentry.configureScope((scope) => {
    scope.setUser(null);
  });
};

const printAPIErrorsAsConsoleTable = (apiErrors) => {
  // eslint-disable-next-line no-console
  if (apiErrors != null && apiErrors.length > 0 && typeof console.table === 'function') {
    console.error('Errors returned by Marketplace API call:');
    // eslint-disable-next-line no-console
    console.table(apiErrors.map((err) => ({ status: err.status, code: err.code, ...err.meta })));
  }
};

const responseApiErrorInfo = (err) =>
  (err?.data?.errors || []).map((e) => ({
    status: e.status,
    code: e.code,
    meta: e.meta,
  }));

/**
 * Logs an exception. If Sentry is configured
 * sends the error information there. Otherwise
 * prints the error to the console.
 *
 * @param {Error} e Error that occurred
 * @param {String} code Error code
 * @param {Object} data Additional data to be sent to Sentry
 */
export const error = (e, code, data) => {
  const apiErrors = responseApiErrorInfo(e);
  if (appSettings.sentryDsn) {
    const extra = { ...data, apiErrorData: apiErrors };

    Sentry.withScope((scope) => {
      scope.setTag('code', code || 'unexpected');
      Object.keys(extra).forEach((key) => {
        scope.setExtra(key, extra[key]);
      });
      Sentry.captureException(e);
    });
  }
  console.error(e);
  console.error('Error code:', code, 'data:', data);
  printAPIErrorsAsConsoleTable(apiErrors);
};

// eslint-disable-next-line no-console
export const info = (...args) => console.info(...args);

// eslint-disable-next-line no-console
export const warn = (...args) => console.warn(...args);

// eslint-disable-next-line no-console
export const log = (...args) => console.log(...args);

// eslint-disable-next-line no-console
export const trace = (...args) => console.trace(...args);
