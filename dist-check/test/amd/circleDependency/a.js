define( 
    'amd/circleDependency/a',
    [ 'amd/circleDependency/b' ],
    function ( b ) {
        return {
            name: 'amd/circleDependency/a',
            check: function () {
                return b.name == 'amd/circleDependency/b' && b.check();
            }
        };
    }
);