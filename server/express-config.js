import helmet from 'helmet';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import { trustProxy } from './config/server';
import csp from './csp';
import { cspEnabled, cspReportUrl, reportOnly } from './config/csp';

const expressConfig = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  if (cspEnabled) {
    app.use(
      bodyParser.json({
        type: ['json', 'application/csp-report'],
      })
    );

    app.use(csp(cspReportUrl, reportOnly));

    const reportValue = (req, key) => {
      const report = req.body ? req.body['csp-report'] : null;
      return report && report[key] ? report[key] : key;
    };

    app.post(cspReportUrl, (req, res) => {
      const effectiveDirective = reportValue(req, 'effective-directive');
      const blockedUri = reportValue(req, 'blocked-uri');
      const msg = `CSP: ${effectiveDirective} doesn't allow ${blockedUri}`;
      res.status(204).send(msg);
    });
  }

  if (trustProxy === 'true') {
    app.enable('trust proxy');
  } else if (trustProxy === 'false') {
    app.disable('trust proxy');
  } else if (trustProxy !== null) {
    app.set('trust proxy', trustProxy);
  }

  app.use(compression());
  app.use(cookieParser());
  app.use(express.static('dist/client', { index: false }));
  app.use(passport.initialize());
};

export default expressConfig;
