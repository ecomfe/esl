define( 
    'cjs/circleDependency/b',
    function ( require, exports, module ) {
        var c = require( 'cjs/circleDependency/c' );
        return {
            name: 'cjs/circleDependency/b',
            check: function () {
                var a = require( 'cjs/circleDependency/a' );
                return a.name == 'cjs/circleDependency/a' 
                        && c.name == 'cjs/circleDependency/c' && c.check();
            }
        };
    }
);