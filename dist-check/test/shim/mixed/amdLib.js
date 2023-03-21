define(function (require) {
    var base = require('./amdBase');
    return {
        name: 'shim mixed amdLib',
        check: function () {
            return base.name === 'shim mixed amdBase';
        }
    };
});
