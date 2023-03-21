define( function ( require ) {
    var a = require( './a' );
    var d = require( './d' );
    var e = require( './e' );

    return {
        name: 'amd/deepDependency3/b',
        check: function () {
            var valid =
                a.name == 'amd/deepDependency3/a' && a.check()
                && d.name == 'amd/deepDependency3/d' && d.check()
                && e.name == 'amd/deepDependency3/e';
            return valid;
        }
    };
} );
