define(
    function (require) {
        var cat = require('./cat');
        var dog = require('./dog');
        return {
            name: 'ud-loader-check-state/index',
            check: function () {
                return cat.name === 'ud-loader-check-state/cat'
                    && dog.name === 'ud-loader-check-state/dog'
                    && cat.check();
            }
        };
    }
);
