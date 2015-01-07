define(function (require) {
    var hybird = require('shimMixedHybird2');

    return {
        check: function () {
            return hybird === shimMixedHybird2 
                && hybird.name === 'shim mixed hybird2';
        }
    };
});
