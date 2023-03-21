define( 
    'cjs/combine/cat',
    function ( require, exports, module ) {
        module.exports = {
            name: 'cjs/combine/cat',
            check: function () {
                return require( 'cjs/combine/index' ).name == 'cjs/combine/index';
            }
        };
    }
);

define( 
    'cjs/combine/dog',
    function ( require, exports, module ) {
        module.exports = {
            name: 'cjs/combine/dog'
        };
    }
);

define( 
    'cjs/combine/lion',
    function ( require, exports, module ) {
        module.exports = {
            name: 'cjs/combine/lion'
        };
    }
);

define( 
    'cjs/combine/tiger',
    function ( require, exports, module ) {
        module.exports = {
            name: 'cjs/combine/tiger'
        };
    }
);

define( 
    'cjs/combine/index', 
    function ( require, exports, module ) {
        var lion = require( 'cjs/combine/lion' );
        var cat = require( 'cjs/combine/cat' );
        var dog = require( 'cjs/combine/dog' );
        var tiger = require( 'cjs/combine/tiger' );

        return {
            name: 'cjs/combine/index',
            check: function () {
                var valid = 
                    cat.name == 'cjs/combine/cat' && cat.check()
                    && dog.name == 'cjs/combine/dog'
                    && tiger.name == 'cjs/combine/tiger'
                    && lion.name == 'cjs/combine/lion';
                return valid;
            }
        };
    }
);



