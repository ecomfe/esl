define( {
    load: function ( resourceId, req, load, config ) {
        var link = document.createElement( 'link' );
        link.setAttribute( 'rel', 'stylesheet' );
        link.setAttribute( 'type', 'text/css' );
        link.setAttribute( 'href', req.toUrl( resourceId ) );

        var parent = document.getElementsByTagName( 'head' )[ 0 ] || document.body;
        parent.appendChild( link ) && ( parent = null );

        load( true );
    }
} );