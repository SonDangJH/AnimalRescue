// We create Redux store directly, instead of using any extra dependencies.
import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createReducerManager from './reducers';
import * as analytics from './analytics/analytics';
import appSettings from './config/settings';

/**
 * Create a new store with the given initial state. Adds Redux
 * middleware and enhancers.
 */
export default function configureStore(initialState = {}, sdk = null, analyticsHandlers = []) {
  const middlewares = [thunk.withExtraArgument(sdk), analytics.createMiddleware(analyticsHandlers)];

  // Enable Redux Devtools in client side dev mode.
  const composeEnhancers =
    appSettings.dev && typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const enhancer = composeEnhancers(applyMiddleware(...middlewares));
  const reducerManager = createReducerManager();
  const store = createStore(reducerManager.reducer, initialState, enhancer);
  reducerManager.setStore(store);
  store.reducerManager = reducerManager;

  return store;
}
