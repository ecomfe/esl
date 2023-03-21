define( 
    'amd/innerDependency/index',
    function ( require ) {
        var lion = require( 'amd/innerDependency/lion' );

        return {
            name: 'amd/innerDependency/index',
            check: function () {
                var cat = require( 'amd/innerDependency/cat' );
                var dog = require( 'amd/innerDependency/dog' );
                var tiger = require( 'amd/innerDependency/tiger' );
                var valid = 
                    cat.name == 'amd/innerDependency/cat'
                    && dog.name == 'amd/innerDependency/dog'
                    && tiger.name == 'amd/innerDependency/tiger'
                    && lion.name == 'amd/innerDependency/lion';
                return valid;
            }
        };
    }
);