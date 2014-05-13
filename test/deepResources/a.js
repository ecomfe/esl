define( function ( require ) {
    var aa = require( './aa' );
    var ab = require( './ab' );

    return {
        name: 'deepResources/a',
        check: function () {
            return aa.name == 'deepResources/aa'
                && ab.name == 'deepResources/ab'
                && aa.check() && ab.check();
        }
    };
});
