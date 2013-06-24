define( function ( require ) {
    alert(require( '../amd/circleDependency/index' ))
    return function () {
        var count = 9999;
        var beforeTime = new Date;
        for ( var i = 0; i < count; i++ ) {
            if ( require( '../amd/circleDependency/index' ).name !== 'amd/circleDependency/index' ) {
                alert( 'require fail' );
            }
        }
        alert( (new Date) - beforeTime );
    };
});