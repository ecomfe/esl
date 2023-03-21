define(function (require) {
    var a = require('./a');
    var b = require('./b');

    return {
        name: 'amd/triangleDependency/lib',
        check: function (){
            return a.name === 'amd/triangleDependency/a'
                && b.name === 'amd/triangleDependency/b';
        }
    }
});