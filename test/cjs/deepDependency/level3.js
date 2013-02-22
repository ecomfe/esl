define( 
    'cjs/deepDependency/level3', 
    function ( require, exports, module ) {
        module.exports = {
            name: 'cjs/deepDependency/level3',
            check: function () {
                var level4 = require( 'cjs/deepDependency/level4' );
                var valid = 
                    level4.name == 'cjs/deepDependency/level4'
                    && level4.check();
                    
                return valid;
            }
        }
    }
);