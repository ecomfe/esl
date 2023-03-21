define(function (require) {
    var c = require('./amdC');
    var b = require('./amdB');

    return {
        name: 'shim mixed amdA',
        check: function () {
            return c.name === 'shim mixed amdC'
                && b.name === 'shim mixed amdB';
        }
    };
});
