
define(function (require) {
    var proxy = require('./hybirdProxy');

    return {
        name: "shim mixed simpleIndirectHybirdDepIndex",
        check: function () {
            return proxy.check();
        }
    };
});
