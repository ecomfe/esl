define( 
    function ( require, exports, module ) {
        var cat = require( './cat' );
        exports.name = 'simple/index';
        exports.check = function () {
            return cat.name == 'simple/cat';
        };
    }
);