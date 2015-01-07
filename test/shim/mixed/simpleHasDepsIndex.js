
define(function (require) {
    var a = require('shimMixedSA');

    return {
        name: "shim mixed simpleHasDepsIndex",
        check: function () {
            return a.raw === shimMixedSA
                && a.e.name === 'shim mixed se'
                && a.f.name === 'shim mixed sf'
                && a.e === shimMixedSE
                && a.f === shimMixedSFOther
                && a.e.c === a.f.c
                && a.e.c === shimMixedSC
                && a.e.d.name === 'shim mixed sd'
                && a.e.d === shimMixedSDOther;
        }
    };
});
