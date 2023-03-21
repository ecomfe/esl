define( 
    function ( require ) {
        var b = require( './b' );
        var e = require( './e' );
        return {
            name: 'amd/complexCircleDependency3/d',
            check: function () {
                var valid = 
                    b.name == 'amd/complexCircleDependency3/b'
                    && e.name == 'amd/complexCircleDependency3/e'
                    && e.check();
                return valid;
            }
        };
    }
);