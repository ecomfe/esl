define( 
    'cjs/simpleDependency/index', 
    function ( require, exports, module ) {
        exports.name = 'cjs/simpleDependency/index';
        exports.check = function () {
            var cat = require( 'cjs/simpleDependency/cat' );
            return cat.name == 'cjs/simpleDependency/cat'
        };
    }
);