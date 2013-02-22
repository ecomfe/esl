define( 
    'cjs/deepDependency/level1', 
    function ( require, exports, module ) {

        module.exports = {
            name: 'cjs/deepDependency/level1',
            check: function () {
                var level2 = require( 'cjs/deepDependency/level2' );
                var level21 = require( 'cjs/deepDependency/level21' );
                var valid = 
                    level2.name == 'cjs/deepDependency/level2'
                    && level21.name == 'cjs/deepDependency/level21';
                    
                return valid;
            }
        };
    }
);