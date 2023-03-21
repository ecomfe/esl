define(
    'bundles/package/index',
    [],
    function () {
        return {
            name: 'bundles/package/index'
        };
    }
);

define('bundlesPackage', ['bundlesPackage/main'], 
    function (main) {return main;}
);

define(
    'bundlesPackage/main',
    [],
    function () {
        return {
            name: 'bundlesPackage/main'
        };
    }
);
