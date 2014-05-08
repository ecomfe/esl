define( function ( require ) {
    var b = require( './b' );

    return {
        name: 'amd/deepDependency3/index',
        check: function () {
            var valid =
                b.name == 'amd/deepDependency3/b' && b.check()
            return valid;
        }
    };
} );
