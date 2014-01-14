define( function (require) {
    var resA = require('./p!resA');
    var resB = require('./p!resB');

    return {
        check: function () {
            return resA === 'resA' && resB === 'resB';
        }
    };
});