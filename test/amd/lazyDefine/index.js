define( function( require ) {
    window.__eslIsLazyDefine = window.__eslLazyDefine != 'sea';
    var sea = require( './sea' );

    return {
        name: 'amd/lazyDefine/index'
    };
});