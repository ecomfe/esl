define( 
    function ( require ) {
        var h3 = require( './h3' );
        return {
            name: 'amd/complexCircleDependency2/s1',
            check: function () {
                var valid = 
                    h3.name == 'amd/complexCircleDependency2/h3'
                    && h3.check();
                return valid;
            }
        };
    }
);