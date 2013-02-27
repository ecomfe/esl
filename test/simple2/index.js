define( 
    function ( require, exports, module ) {
        var cat = require( './cat' );
        exports.name = 'simple2/index';
        exports.check = function () {
            return cat.name == 'simple2/cat';
        };
    }
);