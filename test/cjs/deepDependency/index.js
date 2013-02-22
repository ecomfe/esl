define( 
    'cjs/deepDependency/index', 
    function ( require, exports, module ) {
        var level1 = require( 'cjs/deepDependency/level1' );
        var level11 = require( 'cjs/deepDependency/level11' );

        module.exports = {
            name: 'cjs/deepDependency/index',
            check: function () {
                var valid = 
                    level1.name == 'cjs/deepDependency/level1'
                    && level11.name == 'cjs/deepDependency/level11'
                    && level1.check()
                    && level11.check();
                return valid;
            }
        };
    }
);