define( 
    'cjs/circleDependency/c',
    function ( require, exports, module ) {
        return {
            name: 'cjs/circleDependency/c',
            check: function () {
                var a = require( 'cjs/circleDependency/a' );
                return a.name == 'cjs/circleDependency/a';
            }
        };
    }
);