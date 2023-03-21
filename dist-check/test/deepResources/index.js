define( function ( require ) {
    var a = require( './a' );
    var b = require( './b' );

    return {
        name: 'deepResources/index',
        check: function () {
            return a.name == 'deepResources/a'
                && b.name == 'deepResources/b'
                && a.check() && b.check();
        }
    };
});
