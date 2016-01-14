define(function (require) {
    var lib = require('./lib');
    var sub = require('./sub');

    return {
        name: 'amd/triangleDependency/index',
        check: function (){
            return lib.name === 'amd/triangleDependency/lib'
                && sub.name === 'amd/triangleDependency/sub'
                && lib.check()
                && sub.check();
        }
    }
});