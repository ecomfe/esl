define( 
    function ( require ) {
        
        return {
            name: 'amd/complexCircleDependency3/h',
            check: function () {
                var i = require( './i' );
                var valid = 
                    i.name == 'amd/complexCircleDependency3/i'
                    && i.check();
                return valid;
            }
        };
    }
);