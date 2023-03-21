define(
    function (require) {
        var cat = require('./cat');
        var dog = require('./dog');
        return {
            name: 'ud-loader-wait2/index',
            check: function () {
                return cat.name === 'ud-loader-wait2/cat'
                    && dog.name === 'ud-loader-wait2/dog'
                    && cat.check();
            }
        };
    }
);
