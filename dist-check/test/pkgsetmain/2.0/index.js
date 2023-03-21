define( function ( require ) {
    var cat = require( './cat' );

    return {
        name: 'pkgsetmain',
        check: function () {
            return cat.name == 'pkgsetmain/cat';
        }
    };
} );
