
define(function (require) {
    var b = require('shimMixedSB');
    var g = require('shimMixedSG');


    return {
        name: "shim mixed simpleIndex",
        check: function () {
            return b === shimMixedSBOther && g === shimMixedSGOther;
        }
    };
});
