define( 
    'cjs/simple/index',
    function ( require, exports, module ) {
        var cat = require( 'cjs/simple/cat' );
        exports.name = 'cjs/simple/index';
        exports.check = function () {
            return cat.name == 'cjs/simple/cat';
        };
    }
);