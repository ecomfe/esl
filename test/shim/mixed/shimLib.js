(function (global) {
    var name = 'shim mixed lib';
    var exports = {
        name: name
    };
    global.shimMixedLib = exports;
    global.$$$$$$ = exports;

    if (typeof define === 'function' && define.amd) {
        define('shimMixedLib', exports);
    }
})(window);
