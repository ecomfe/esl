define( 
    'cjs/deepDependency/level11', 
    function ( require, exports, module ) {
        var level22 = require( './level22' );
        var level23 = require( './level23' );
        return {
            name: 'cjs/deepDependency/level11',
            check: function () {
                var valid = 
                    level22.name == 'cjs/deepDependency/level22'
                    && level23.name == 'cjs/deepDependency/level23'
                    && level22.check()
                    && level23.check();
                    
                return valid;
            }
        };
    }
);