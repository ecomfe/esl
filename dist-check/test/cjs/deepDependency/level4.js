define( 
    'cjs/deepDependency/level4', 
    function ( require, exports, module ) {
        module.exports = {
            name: 'cjs/deepDependency/level4',
            check: function () {
                var valid = require( './level5' ).name == 'cjs/deepDependency/level5';
                    
                return valid;
            }
        };
    }
);