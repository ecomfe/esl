define( 
    function ( require, exports, module ) {
        var a = require( './a' );
        var d = require( './d' );
        module.exports = {
            name: 'cjs/circleDependency/cat',
            check: function () {
                return a.name == 'cjs/circleDependency/a' 
                        && d.name == 'cjs/circleDependency/d' 
                        && a.check() && d.check();
            }
        };
    }
);