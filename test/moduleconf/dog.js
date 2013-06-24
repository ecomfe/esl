define( ['module'], function ( module ) {
    return {
        name: 'moduleconf/dog',
        check: function () {
            var conf = module.config();console.log(conf)
            return conf && !conf.desc;
        }
    };
} );