define( 
    function ( require ) {
        var j = require( './j' );
        return {
            name: 'amd/complexCircleDependency3/i',
            check: function () {
                var valid = 
                    j.name == 'amd/complexCircleDependency3/j'
                    && j.check();
                return valid;
            }
        };
    }
);