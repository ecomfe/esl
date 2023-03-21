define( 
    'cjs/circleDependency/e',
    function ( require, exports, module ) {
        return {
            name: 'cjs/circleDependency/e',
            check: function () {
                var d = require( 'cjs/circleDependency/d' );
                return d.name == 'cjs/circleDependency/d';
            }
        };
    }
);