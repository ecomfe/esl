define('ud-loader-mix/index',
    function (require) {
        var cat = require('./cat');
        return {
            name: 'ud-loader-mix/index',
            check: function () {
                return cat.name === 'ud-loader-mix/cat'
                    && cat.check();
            }
        };
    }
);

define('ud-loader-mix/cat',
    function (require) {
        return {
            name: 'ud-loader-mix/cat'
        };
    }
);

