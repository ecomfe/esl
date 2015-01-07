
define(function (require) {
    var b = require('shimMixedSB');

    return {
        name: "shim mixed simpleIndex",
        check: function () {
            return b === shimMixedSBOther; 
        }
    };
});
