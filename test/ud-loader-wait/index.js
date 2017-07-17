define(
    function (require) {
        var cat = require('./cat');
        var dog = require('./dog');
        return {
            name: 'ud-loader-wait/index',
            check: function () {
                return cat.name === 'ud-loader-wait/cat'
                    && dog.name === 'ud-loader-wait/dog'
                    && cat.check();
            }
        };
    }
);
