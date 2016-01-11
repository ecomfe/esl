define(function (require) {
    var b = require('./b');

    return {
        name: 'amd/triangleDependency/a',
        check: function () {
            return b.name === 'amd/triangleDependency/b';
        }
    }
});