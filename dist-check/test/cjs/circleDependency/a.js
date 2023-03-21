define( 
    'cjs/circleDependency/a',
    function ( require, exports, module ) {
        var b = require( './b' );
        return {
            name: 'cjs/circleDependency/a',
            check: function () {
                return b.name == 'cjs/circleDependency/b' && b.check();
            }
        };
    }
);