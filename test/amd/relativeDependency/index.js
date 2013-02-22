define( 
    [ './inner/cat' ], 
    function ( cat ) {
        return {
            name: 'amd/relativeDependency/index',
            check: function () {
                return cat.check() && cat.name == 'amd/relativeDependency/inner/cat'
            }
        };
    }
);