define( function ( require ) {
    var c = require( './c' );
    var e = require( './e' );

    return {
        name: 'amd/deepDependency3/d',
        check: function () {
            var valid =
                c.name == 'amd/deepDependency3/c'
                && e.name == 'amd/deepDependency3/e'
            return valid;
        }
    };
} );
