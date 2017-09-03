define( 
    function (require) {
        var cat = require('./cat');
        return {
            name: 'just-fetch/index',
            check: function () {
                return cat.name == 'just-fetch/cat';
            }
        };
    }
);