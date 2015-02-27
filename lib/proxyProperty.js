'use strict';

module.exports = proxyProperty;

function proxyProperty (destination, source, settable, name) {
  if (typeof source !== 'function') {
    source = function () {return this;}.bind(source);
  }
  return Object.defineProperty(destination, name, {
    'enumerable': true,
    'get': function () {
      var value = source()[name];
      if (typeof value === 'function') {
        value = value.bind(source());
      }
      return value;
    },
    'set': function (newValue) {
      if (settable) {
        source()[name] = newValue;
      }
    }
  });
}
