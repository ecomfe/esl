define( 
    'cjs/circleDependency/d',
    function ( require, exports, module ) {
        var e = require( './e' );
        return {
            name: 'cjs/circleDependency/d',
            check: function () {
                return e.name == 'cjs/circleDependency/e' && e.check();
            }
        };
    }
);