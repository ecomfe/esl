define( 
    function ( require, exports, module ) {
        var lion = require( './lion' );
        var cat = require( './cat' );
        var dog = require( './dog' );
        var tiger = require( './tiger' );

        return {
            name: 'cjs/manyDependencies/index',
            check: function () {
                var valid = 
                    cat.name == 'cjs/manyDependencies/cat'
                    && dog.name == 'cjs/manyDependencies/dog'
                    && tiger.name == 'cjs/manyDependencies/tiger'
                    && lion.name == 'cjs/manyDependencies/lion';
                return valid;
            }
        };
    }
);