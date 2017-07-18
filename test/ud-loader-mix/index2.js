define(
    function (require) {
        var cat = require('./cat');
        return {
            name: 'ud-loader-mix/index2',
            check: function () {
                return cat.name === 'ud-loader-mix/cat'
                    && cat.check();
            }
        };
    }
);
