define( 'pkgclassic/main', function ( require ) {
    var cat = require( './cat' );

    return {
        name: 'pkgclassic',
        check: function () {
            return cat.name == 'pkgclassic/cat';
        }
    };
} );
