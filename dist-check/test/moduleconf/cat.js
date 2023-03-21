define( ['module'], function ( module ) {
    return {
        name: 'moduleconf/cat',
        check: function () {
            return module.config().desc === 'cat';
        }
    };
} );