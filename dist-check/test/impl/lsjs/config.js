/* 
Note: When running the tests for the lsjs loader make sure localStorage has been
cleared for the first run to ensure the latest version of the tests are executed.
Either clear the browser cookies or programatically run localStorage.clear();
*/
var config = lsjs,
    go = lsjs,
    implemented = {
		basic: true,
		anon: true,
		funcString: true,
        namedWrapped: true,
		require: true,
		plugins: true
		//pluginDynamic: true
    };
require = undefined;
