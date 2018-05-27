'use strict';

var historyInstance = void 0,
    localStorageInstance = void 0;

module.exports = {

  /** Set a browser friendly or custom implemention */
  set history(h) {
    historyInstance = h;
  },

  /** @return node or react native friendly implemention (unless setter was called) */
  get history() {
    if (historyInstance) {
      return historyInstance;
    }
    var createHistory = require('history').createMemoryHistory;
    historyInstance = createHistory();
    return historyInstance;
  },

  /** Set a browser friendly or custom implemention */
  set localStorage(ls) {
    localStorageInstance = ls;
  },

  /** @return node or react native friendly implemention (unless setter was called) */
  get localStorage() {
    if (localStorageInstance) {
      return localStorageInstance;
    }
    localStorageInstance = require('localStorage');
    return localStorageInstance;
  }

};