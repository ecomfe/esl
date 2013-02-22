define( 
    'amd/combine/cat',
    function ( require ) {
        return {
            name: 'amd/combine/cat',
            check: function () {
                return require( 'amd/combine/index' ).name == 'amd/combine/index';
            }
        };
    }
);

define( 
    'amd/combine/dog',
    function () {
        return {
            name: 'amd/combine/dog'
        };
    }
);

define( 
    'amd/combine/lion',
    function () {
        return {
            name: 'amd/combine/lion'
        };
    }
);

define( 
    'amd/combine/tiger',
    function () {
        return {
            name: 'amd/combine/tiger'
        };
    }
);

define( 
    'amd/combine/index', 
    [ 
        'amd/combine/cat', 
        'amd/combine/dog',
        'amd/combine/tiger',
        'amd/combine/lion',
    ], 
    function ( cat, dog, tiger ) {
        var lion = require( 'amd/combine/lion' );

        return {
            name: 'amd/combine/index',
            check: function () {
                var valid = 
                    cat.name == 'amd/combine/cat' && cat.check()
                    && dog.name == 'amd/combine/dog'
                    && tiger.name == 'amd/combine/tiger'
                    && lion.name == 'amd/combine/lion';
                return valid;
            }
        };
    }
);



