define( 
    function ( require, exports, module ) {
        var cat = require( './cat' );
        module.exports = {
            name: 'cjs/circleDependency/index',
            check: function () {
                var valid = 
                    cat.name == 'cjs/circleDependency/cat'
                    && require( './dog' ).name == 'cjs/circleDependency/dog'
                    && cat.check();
                return valid;
            }
        };
    }
);