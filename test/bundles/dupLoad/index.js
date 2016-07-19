window.__dupLoad__ = window.__dupLoad__ == null ? 1 : ++window.__dupLoad__;

define('bundles/dupLoad/index', function (require, module, exports) {
    return {
        name: 'bundles/dupLoad/index',
        check: function () {
            return window.__dupLoad__ === 1;
        }
    };
});

define('bundles/dupLoad/packageA', function () {});
define('bundles/dupLoad/packageB', function () {});