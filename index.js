var requireDir = require('require-dir');
var scripts = requireDir('./scripts');

module.exports = function (gulp, config) {
  for (var name in scripts) {
    var register = scripts[name];
    if (register && typeof(register) === 'function') {
      register(gulp, config);
    }
  }
};
