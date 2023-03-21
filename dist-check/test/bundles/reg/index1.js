define('bundles/reg/index1',
    [
        'require',
        './model1',
        './view1',
        './lib'
    ],
    function (require) {
        var m = require('./model1');
        var v = require('./view1');
        var lib = require('./lib');

        return {
            name: 'bundles/reg/index1',
            check: function () {
                return m.name === 'bundles/reg/model1'
                    && v.name === 'bundles/reg/view1'
                    && lib.name === 'bundles/reg/lib'
                    && v.check();
            }
        };
    }
);

define('bundles/reg/view1', ['require', './lib', './tpl!./tpl1'], function (require) {
    var tpl = require('./tpl!./tpl1');
    var lib = require('./lib');
    return {
        name: 'bundles/reg/view1',
        check: function () {
            return tpl === 'bundles/reg/tpl!bundles/reg/tpl1'
                    && lib.name === 'bundles/reg/lib'
        }
    };
});

define('bundles/reg/tpl!bundles/reg/tpl1', 'bundles/reg/tpl!bundles/reg/tpl1');
define('bundles/reg/tpl', {});


define('bundles/reg/model1', ['require'], function (r) {
    return {
        name: 'bundles/reg/model1'
    };
});

define('bundles/reg/lib', [], function () {
    return {
        name: 'bundles/reg/lib'
    }
});
