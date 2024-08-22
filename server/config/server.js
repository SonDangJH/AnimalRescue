const {
  PORT,
  VITE_PORT,
  BASE,
  SERVER_SHARETRIBE_TRUST_PROXY,
  BASIC_AUTH_USERNAME,
  BASIC_AUTH_PASSWORD,
} = process.env;

export const port = PORT || VITE_PORT || 5173;
export const base = BASE || '/';
export const preventDataLoadingInSsr = process.env.PREVENT_DATA_LOADING_IN_SSR === 'true';
export const trustProxy = SERVER_SHARETRIBE_TRUST_PROXY || null;

export const basicAuth = {
  username: BASIC_AUTH_USERNAME,
  password: BASIC_AUTH_PASSWORD,
};

export default {
  port,
  base,
  preventDataLoadingInSsr,
  trustProxy,
  basicAuth,
};
