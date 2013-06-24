define( ['module'], function ( module ) {
    return {
        name: 'moduleconf/dog',
        check: function () {
            var conf = module.config();
            return conf && !conf.desc;
        }
    };
} );