define(function (require) {
    var lib = require('shimMixedLib');
    var ui = require('shimMixedUI');
    var amdLib = require('./amdLib');
    var a = require('./amdA');
    var b = require('./amdB');

    return {
        name: "shim mixed complexIndex",
        check: function () {
            return a.check()
                && b.check()
                && amdLib.name === 'shim mixed amdLib'
                && lib.name === 'shim mixed lib'
                && ui.name === 'shim mixed ui'
                && shimMixedUI.name === 'shim mixed ui';
        }
    };
});
