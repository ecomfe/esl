define( 
    'amd/circleDependency/index', 
    [ 
        'require',
        'amd/circleDependency/cat', 
        'amd/circleDependency/dog'
    ], 
    function ( require, cat ) {
        return {
            name: 'amd/circleDependency/index',
            check: function () {
                var valid = 
                    cat.name == 'amd/circleDependency/cat'
                    && require( 'amd/circleDependency/dog' ).name == 'amd/circleDependency/dog'
                    && cat.check();
                return valid;
            }
        };
    }
);