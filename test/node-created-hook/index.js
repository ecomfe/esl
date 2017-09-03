define( 
    function (require) {
        var cat = require('./cat');
        return {
            name: 'node-created-hook/index',
            check: function () {
                return cat.name == 'node-created-hook/cat';
            }
        };
    }
);