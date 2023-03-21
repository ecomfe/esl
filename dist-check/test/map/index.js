define(function (require) {
    var view = require('./view');
    var lib = require('./lib');

    return {
        name: 'map/index',
        check: function () {
            return view.name === 'map/view' && lib.name === 'map/betterlib';
        }
    };
});