
(function (global) {
    var name = 'shim mixed hybird2';
    var exports = {
        name: name
    };
    global.shimMixedHybird2 = exports;

    if (typeof define === 'function' && define.amd) {
        define('shimMixedHybird2', exports);
    }
})(window);
