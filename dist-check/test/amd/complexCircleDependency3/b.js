define( 
    function ( require ) {
        var c = require( './c' );
        return {
            name: 'amd/complexCircleDependency3/b',
            check: function () {
                var valid = 
                    c.name == 'amd/complexCircleDependency3/c'
                    && c.check();
                return valid;
            }
        };
    }
);