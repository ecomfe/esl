define( function ( require ) {
    var res = require( './plugin!./b' );

    return {
        name: 'deepResources/b',
        check: function () {
            return res.indexOf('b resource') === 0;
        }
    };
});
