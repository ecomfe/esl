(function (global) {
    var name = 'shim mixed hybird';
    var exports = {
        name: name
    };
    global.shimMixedHybird = exports;

    if (typeof define === 'function' && define.amd) {
        define('shimMixedHybird', exports);
    }
})(window);
