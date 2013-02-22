define( 
    'amd/manyDependencies/index', 
    [ 
        'amd/manyDependencies/cat', 
        'amd/manyDependencies/dog',
        'amd/manyDependencies/tiger',
        'amd/manyDependencies/lion',
    ], 
    function ( cat, dog, tiger ) {
        var lion = require( 'amd/manyDependencies/lion' );

        return {
            name: 'amd/manyDependencies/index',
            check: function () {
                var valid = 
                    cat.name == 'amd/manyDependencies/cat'
                    && dog.name == 'amd/manyDependencies/dog'
                    && tiger.name == 'amd/manyDependencies/tiger'
                    && lion.name == 'amd/manyDependencies/lion';
                return valid;
            }
        };
    }
);