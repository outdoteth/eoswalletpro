'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var assert = require('assert');

module.exports = Storage;

/**
  Generic array key based storage.

  - Allows null or undefined
  - Uses a prefix-friendly key encoding for searching
  - Serilization is handled externally
*/
function Storage(namespace) {

  function createKey() {
    for (var _len = arguments.length, elements = Array(_len), _key = 0; _key < _len; _key++) {
      elements[_key] = arguments[_key];
    }

    var key = JSON.stringify([namespace].concat(elements));
    // remove [ and ] so key is prefix-friendly for searching
    var keyTrim = key.substring(1, key.length - 1);
    return Buffer.from(keyTrim).toString('hex');
  }

  /**
    Save a value to state.
     @return {boolean} dirty
    @throws {AssertionError} immutable
  */
  function save(state, key, value) {
    var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
        _ref$immutable = _ref.immutable,
        immutable = _ref$immutable === undefined ? true : _ref$immutable,
        _ref$clobber = _ref.clobber,
        clobber = _ref$clobber === undefined ? true : _ref$clobber;

    assert.equal(typeof state === 'undefined' ? 'undefined' : _typeof(state), 'object', 'state');

    key = Array.isArray(key) ? createKey.apply(undefined, _toConsumableArray(key)) : key;
    assert.equal(typeof key === 'undefined' ? 'undefined' : _typeof(key), 'string', 'key');

    assert(value == null || typeof value === 'string' || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object', 'value should be null, a string, or a serializable object');

    var existing = deNull(state[key]); // convert 'null' string back into null

    if (value == null && existing != null && !clobber) {
      // don't erase it, keep the existing value
      value = existing;
    }

    var dirty = existing !== value;
    assert(existing == null || !(dirty && immutable), 'immutable');

    if (dirty) {
      state[key] = value;
    }

    return dirty;
  }

  /**
    @arg {object} state
    @arg {string|Array} key
    @arg {string} [defaultValue]
     @return {string}
  */
  function get(state, key) {
    assert.equal(typeof state === 'undefined' ? 'undefined' : _typeof(state), 'object', 'state');

    key = Array.isArray(key) ? createKey.apply(undefined, _toConsumableArray(key)) : key;
    assert.equal(typeof key === 'undefined' ? 'undefined' : _typeof(key), 'string', 'key');

    return deNull(state[key]);
  }

  /**
    @arg {object} state - localStorage, etc
    @arg {Array<string>} keyPrefix - index, if partial path, the rest of the
    key elements end up in keySuffix.
     @arg {function} callback(keySuffix = [], value) return false to stop looping
  */
  function query(state, keyPrefix, callback) {
    assert.equal(typeof state === 'undefined' ? 'undefined' : _typeof(state), 'object', 'state');
    assert(Array.isArray(keyPrefix), 'keyPrefix is an array');
    assert.equal(typeof callback === 'undefined' ? 'undefined' : _typeof(callback), 'function', 'callback');

    var prefix = createKey.apply(undefined, _toConsumableArray(keyPrefix));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(state)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (key.indexOf(prefix) !== 0) {
          continue;
        }
        var decodedKeys = JSON.parse('[' + Buffer.from(key, 'hex') + ']');
        var ret = callback(decodedKeys.slice(keyPrefix.length + 1), deNull(state[key]));
        if (ret === false) {
          break;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return {
    createKey: createKey,
    save: save,
    get: get,
    query: query
  };
}

var deNull = function deNull(value) {
  return value === 'null' ? null : value === 'undefined' ? undefined : value;
};