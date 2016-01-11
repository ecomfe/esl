define(function (require) {
    var a = require('./a');
    var b = require('./b');

    return {
        name: 'amd/triangleDependency/index',
        check: function (){
            return a.name === 'amd/triangleDependency/a'
                && b.name === 'amd/triangleDependency/b'
                && a.check();
        }
    }
});