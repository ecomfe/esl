define( {
    load: function ( resourceId, req, load, config ) {
        assert_toUrl( 'plugin:' + resourceId, require.toUrl( resourceId ) );

        load( {
            name: resourceId
        } );
    }
} );