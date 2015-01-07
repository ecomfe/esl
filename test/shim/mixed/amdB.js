
define(function (require) {
    var c = require('./amdC');

    return {
        name: 'shim mixed amdB',
        check: function () {
            return c.name === 'shim mixed amdC';
        }
    };
});
