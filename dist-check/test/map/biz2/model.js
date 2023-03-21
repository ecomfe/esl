define(function (require) {
    var view = require('../view');
    var lib = require('../lib');

    return {
        name: 'map/biz2/model',
        check: function () {
            return view.name === 'map/formview' && lib.name === 'map/betterlib';
        }
    };
});