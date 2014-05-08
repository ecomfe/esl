define( function ( require ) {
    var c = require( './c' );

    return {
        name: 'amd/deepDependency3/a',
        check: function () {
            var valid =
                c.name == 'amd/deepDependency3/c';
            return valid;
        }
    };
} );
