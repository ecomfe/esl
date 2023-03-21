/* 
Note: When running the tests for the inject loader make sure localStorage has been
cleared for the first run to ensure the latest version of the tests are executed.
Either clear the browser cookies or programatically run localStorage.clear();
*/
function setModuleRoot() {
  var url = location.href.split("?")[0],
      base = url.substr(0, url.lastIndexOf("/")+1);
  Inject.setModuleRoot(base);
}

Inject.reset();
var config = function(pathObj) {
      for(var key in pathObj.paths) {
        Inject.addRule(key, {path:pathObj.paths[key]});
      }
    },
    go = function() {
      setModuleRoot();
      Inject.require.apply(this, arguments)
    },
    implemented = {
        basic: true,
        anon: true,
        funcString: true,
        namedWrapped: true,
        require: true
        // plugins: true
        // pluginDynamic: true
    };
require = undefined;
