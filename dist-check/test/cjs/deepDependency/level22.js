define( 
    'cjs/deepDependency/level22', 
    function ( require, exports, module ) {
        var level3 = require( 'cjs/deepDependency/level3' );
        module.exports = {
            name: 'cjs/deepDependency/level22',
            check: function () {
                var valid = 
                    level3.name == 'cjs/deepDependency/level3'
                    && level3.check();
                    
                return valid;
            }
        };
    }
);