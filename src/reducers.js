import { combineReducers } from 'redux';
import { USER_LOGOUT } from './ducks/auth.duck';
import * as globalReducers from './ducks';
import * as pageReducers from './containers/reducers';
import { getAllExtensionReducers } from './extension';

const extensionReducers = await getAllExtensionReducers();

const createReducerManager = () => {
  const reducers = { ...globalReducers, ...pageReducers, ...extensionReducers };

  let store = null;

  let combinedReducer = combineReducers(reducers);

  const appReducer = (state, action) => {
    const appState = action.type === USER_LOGOUT ? undefined : state;

    if (action.type === USER_LOGOUT && typeof window !== 'undefined' && !!window.sessionStorage) {
      window.sessionStorage.clear();
    }

    return combinedReducer(appState, action);
  };

  return {
    reducer: appReducer,
    add: (key, reducer) => {
      if (!key || reducers[key]) {
        return;
      }
      reducers[key] = reducer;
      combinedReducer = combineReducers(reducers);
      store?.replaceReducer(appReducer);
    },
    // the store is needed to replace the reducer. This method should be call as soon as the store is created
    setStore(newStore) {
      store = newStore;
    },
  };
};

export default createReducerManager;
