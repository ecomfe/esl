define( 
    'cjs/circleDependency/c',
    function ( require, exports, module ) {
        var c = require( './c' );
        return {
            name: 'cjs/circleDependency/c',
            check: function () {
                var a = require( 'cjs/circleDependency/a' );
                return a.name == 'cjs/circleDependency/a';
            }
        };
    }
);