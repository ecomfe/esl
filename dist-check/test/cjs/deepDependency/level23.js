define( 
    'cjs/deepDependency/level23', 
    function ( require, exports, module ) {
        var level31 = require( 'cjs/deepDependency/level31' );
        module.exports = {
            name: 'cjs/deepDependency/level23',
            check: function () {
                var valid = 
                    level31.name == 'cjs/deepDependency/level31';
                    
                return valid;
            }
        };
    }
);