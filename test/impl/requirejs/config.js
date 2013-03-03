
//Map the configure({}) call to loader-specific call.
var config = require,

    //Map the top-level entry point to start loading to loader-specific call.
    go = require,

    //Indicate what levels of the API are implemented by this loader,
    //and therefore which tests to run.
    implemented = {
        basic: true,
        anon: true,
        funcString: true,
        namedWrapped: true,
        require: true,
        plugins: true,
        pathsConfig: true,
        packagesConfig: true,
        mapConfig: true,
        moduleConfig: true,
        shimConfig: true
        //Does NOT support pluginDynamic in 1.0
        //pluginDynamic: true
    };

//Remove the global require, to make sure a global require is not assumed
//in the tests
require = undefined;
