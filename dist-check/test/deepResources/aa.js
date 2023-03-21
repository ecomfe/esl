define( function ( require ) {
    var res = require( './plugin!./aa' );

    return {
        name: 'deepResources/aa',
        check: function () {
            return res.indexOf('aa resource') === 0;
        }
    };
});
