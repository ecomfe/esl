define( function ( require, exports ) {
    var simple = require( 'simple/index' );

    exports.name = 'usecjs/change2amd';
    exports.check = function () {
        return simple.name == 'amd/simple/index';
    };
} );