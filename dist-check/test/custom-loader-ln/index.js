define(
    function (require) {
        var cat = require('./cat');
        return {
            name: 'custom-loader/index',
            check: function () {
                return cat.name === 'custom-loader/cat'
            }
        };
    }
);
