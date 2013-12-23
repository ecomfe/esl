define( 
    function ( require ) {
        var c = require( './c' );
        return {
            name: 'amd/complexCircleDependency3/j',
            check: function () {
                var valid = 
                    c.name == 'amd/complexCircleDependency3/c';
                return valid;
            }
        };
    }
);