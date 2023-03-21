
define(function (require) {
    var hybird = require('shimMixedHybird');

    return {
        name: "shim mixed simpleHybirdDepIndex",
        check: function () {
            return hybird.name === 'shim mixed hybird' 
                && hybird === shimMixedHybird;
        }
    };
});
