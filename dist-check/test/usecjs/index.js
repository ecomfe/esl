define( function ( require, exports ) {
    var simple = require( 'simple/index' );
    var simple2 = require( 'simple2/index' );

    exports.name = 'usecjs/index';
    exports.check = function () {
        return simple.name == 'cjs/simple/index' && simple.check()
            && simple2.name == 'simple2/index' && simple2.check();
    };
} );