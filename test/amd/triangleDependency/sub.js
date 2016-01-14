define(function (require) {
    var lib = require('./lib');

    return {
        name: 'amd/triangleDependency/sub',
        check: function (){
            return lib.name === 'amd/triangleDependency/lib' && lib.check();
        }
    }
});