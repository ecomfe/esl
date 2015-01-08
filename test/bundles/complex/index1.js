define('bundles/complex/index1',
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
            name: 'bundles/complex/index1',
            check: function () {
                return m.name === 'bundles/complex/model1'
                    && v.name === 'bundles/complex/view1'
                    && lib.name === 'bundles/complex/lib'
                    && v.check();
            }
        };
    }
);

define('bundles/complex/view1', ['require', './lib', './tpl!./tpl1'], function (require) {
    var tpl = require('./tpl!./tpl1');
    var lib = require('./lib');
    return {
        name: 'bundles/complex/view1',
        check: function () {
            return tpl === 'bundles/complex/tpl!bundles/complex/tpl1'
                    && lib.name === 'bundles/complex/lib'
        }
    };
});

define('bundles/complex/tpl!bundles/complex/tpl1', 'bundles/complex/tpl!bundles/complex/tpl1');
define('bundles/complex/tpl', {});


define('bundles/complex/model1', ['require'], function (r) {
    return {
        name: 'bundles/complex/model1'
    };
});

define('bundles/complex/lib', [], function () {
    return {
        name: 'bundles/complex/lib'
    }
});
