'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-env mocha */
var assert = require('assert');

var UriRules = require('./uri-rules');

describe('Path Rules', function () {

  var uriRules = UriRules({
    'owner': '/account_recovery',
    'active': '/(transfers|contracts)',
    'active/**': '/contract'
  });

  var fixtures = [{ // 1
    uri: '/account_recovery',
    paths: ['owner', 'active', 'active/mypermission'],
    allow: ['owner', 'active', 'active/mypermission'], deny: []
  }, { // 2
    uri: '/transfers',
    paths: ['active', 'active/mypermission', 'owner'],
    allow: ['active', 'active/mypermission'], deny: ['owner']
  }, { // 3
    uri: '/contract',
    paths: ['active', 'active/mypermission', 'owner'],
    allow: ['active/mypermission'], deny: ['active', 'owner']
  }, { // 4
    uri: '/',
    paths: ['active', 'active/mypermission', 'owner'],
    allow: [], deny: ['active', 'active/mypermission', 'owner']
  }];

  var fixtureIndex = 1;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var test = _step.value;
      var paths = test.paths,
          uri = test.uri,
          allow = test.allow,
          deny = test.deny;


      it('Test ' + fixtureIndex + ' Path Rules: ' + JSON.stringify(test), function () {
        assert.deepEqual(uriRules.check(uri, paths), { allow: allow, deny: deny });
        assert.deepEqual(uriRules.allow(uri, paths), allow);
        assert.deepEqual(uriRules.deny(uri, paths), deny);
      });
      fixtureIndex++;
    };

    for (var _iterator = fixtures[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
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
});

describe('Uri Rules', function () {
  var fixtures = [{
    rule: 'start-with',
    allow: ['start-with', 'start-with/', 'start-with#hp1', 'start-with?qp1', 'start-with/#hp1', 'start-with/?qp1'],
    deny: ['start-with-not', 'not-start-with', '/start-with', 'not/start-with']
  }, {
    rule: 'end-with$',
    allow: ['end-with'],
    deny: ['not-end-with', '/end-with', 'end-with/', 'mypath/end-with', 'end-with?', 'end-with?qp', 'end-with#hp=1']
  }];

  var keyPath = 'active/other';

  var fixtureIndex = 1;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    var _loop2 = function _loop2() {
      var test = _step2.value;
      var rule = test.rule,
          allow = test.allow,
          deny = test.deny;

      var uriRules = UriRules(_defineProperty({}, keyPath, rule));

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        var _loop3 = function _loop3() {
          var path = _step3.value;

          it('Test ' + fixtureIndex + ' Uri rule \'' + rule + '\' allows \'' + path + '\'', function () {
            assert.deepEqual([keyPath], uriRules.allow(path, [keyPath]));
          });
        };

        for (var _iterator3 = allow[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          _loop3();
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        var _loop4 = function _loop4() {
          var path = _step4.value;

          it('Test ' + fixtureIndex + ' Uri rule \'' + rule + '\' denies \'' + path + '\'', function () {
            assert.deepEqual([keyPath], uriRules.deny(path, [keyPath]));
          });
        };

        for (var _iterator4 = deny[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          _loop4();
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      fixtureIndex++;
    };

    for (var _iterator2 = fixtures[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      _loop2();
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
});