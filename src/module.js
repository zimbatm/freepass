(function() {
  function module(id, def) {
    exports[id] = {id: id, def: def, exports: null}
  }
  
  var exports = {
    // Default browser module that exports the browser env
    browser: {
      exports: {
        window: window,
        document: document
      }
    }
  };
  
  function require(id) {
    //FIXME: relative paths
    if (!(id in exports)) {
      throw "Unknown module '" + id + "'";
    }
    var mod = exports[id];
    if (!mod.exports) {
      mod.exports = {};
      mod.def.call(null, mod, mod.exports, require);
    }
    return mod.exports;
  }
  
  ;;;
  
  require(";;;");
}());