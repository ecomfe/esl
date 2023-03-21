define( 
    function ( require, exports, module ) {
    	var cat = require( './inner/cat' );
        module.exports = {
            name: 'cjs/relativeDependency/index',
            check: function () {
                return cat.check() && cat.name == 'cjs/relativeDependency/inner/cat'
            }
        };
    }
);