define( 
    'amd/simpleDependency/index', 
    [ 'amd/simpleDependency/cat' ], 
    function ( cat ) {
        return {
            name: 'amd/simpleDependency/index',
            check: function () {
                return cat.name == 'amd/simpleDependency/cat'
            }
        };
    }
);