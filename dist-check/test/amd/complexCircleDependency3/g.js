define( 
    function ( require ) {
        var h = require( './h' );
        return {
            name: 'amd/complexCircleDependency3/g',
            check: function () {
                var valid = 
                    h.name == 'amd/complexCircleDependency3/h'
                    && h.check();
                return valid;
            }
        };
    }
);