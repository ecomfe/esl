define( 
    function ( require ) {
        var g = require( './g' );
        return {
            name: 'amd/complexCircleDependency3/c',
            check: function () {
                var d = require( './d' );
                var valid = 
                    g.name == 'amd/complexCircleDependency3/g'
                    && g.check()
                    && d.name == 'amd/complexCircleDependency3/d'
                    && d.check();
                return valid;
            }
        };
    }
);