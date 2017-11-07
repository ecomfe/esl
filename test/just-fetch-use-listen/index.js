define( 
    function (require) {
        var cat = require('./cat');
        return {
            name: 'just-fetch-use-listen/index',
            check: function () {
                return cat.name == 'just-fetch-use-listen/cat';
            }
        };
    }
);