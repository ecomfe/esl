define( function ( require ) {
    assert_toUrl( 'local:normal', require.toUrl( 'normal' ) );
    assert_toUrl( 'local:normal.js', require.toUrl( 'normal.js' ) );
    assert_toUrl( 'local:paths-relative', require.toUrl( 'relapath' ) );
    assert_toUrl( 'local:paths-relative.js', require.toUrl( 'relapath.js' ) );
    assert_toUrl( 'local:paths-absolute', require.toUrl( 'abspath' ) );
    assert_toUrl( 'local:paths-http', require.toUrl( 'tangram' ) );


    assert_toUrl( 'local:pkg-main', require.toUrl( 'pkgsetmain' ) );
    assert_toUrl( 'local:pkg-main.js', require.toUrl( 'pkgsetmain.js' ) );
    assert_toUrl( 'local:pkg-module', require.toUrl( '../pkgsetmain/mod' ) );
    assert_toUrl( 'local:pkg-module.js', require.toUrl( '../pkgsetmain/mod.js' ) );

    assert_toUrl( 'local:relative-id', require.toUrl( './relative' ) );
    assert_toUrl( 'local:map', require.toUrl( '../simple' ) );

    require('./plugin!normal');
    require('./plugin!../tangram');
    require('./plugin!./relative');
    require('./plugin!../simple');
    return {};
})
