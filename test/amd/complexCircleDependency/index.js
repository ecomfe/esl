define( 
    function ( require ) {
        var h1 = require( './h1' );
        return {
            name: 'amd/complexCircleDependency/index',
            check: function () {
                var valid = 
                    h1.name == 'amd/complexCircleDependency/h1'
                    && h1.check();
                return valid;
            }
        };
    }
);