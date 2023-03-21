define(
    function (require) {
        var animal = require('./animal');
        return {
            name: 'ud-loader-wait2/cat',
            check: function () {
                return animal.name === 'ud-loader-wait2/animal';
            }
        };
    }
);
