define( 
    'amd/innerRelativeDependency/index',
    function ( require ) {
        var lion = require( './lion' );

        return {
            name: 'amd/innerRelativeDependency/index',
            check: function () {
                var cat = require( './cat' );
                var dog = require( './dog' );
                var tiger = require( 'amd/innerRelativeDependency/tiger' );
                var valid = 
                    cat.name == 'amd/innerRelativeDependency/cat'
                    && dog.name == 'amd/innerRelativeDependency/dog'
                    && tiger.name == 'amd/innerRelativeDependency/tiger'
                    && lion.name == 'amd/innerRelativeDependency/lion';
                return valid;
            }
        };
    }
);