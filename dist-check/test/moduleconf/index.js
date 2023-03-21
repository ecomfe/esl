define( function ( require, exports, module ) {
    return {
        name: 'moduleconf/index',
        check: function () {
            var cat = require( './cat' );
            var dog = require( './dog' );

            return module.config().desc === 'index'
                && cat.name === 'moduleconf/cat'
                && cat.check()
                && dog.name === 'moduleconf/dog'
                && dog.check();
        }
    };
} );