define( 
    'amd/circleDependency/cat',
    [ 'amd/circleDependency/a', 'amd/circleDependency/d' ],
    function ( a, d ) {
        return {
            name: 'amd/circleDependency/cat',
            check: function () {
                return a.name == 'amd/circleDependency/a' 
                        && d.name == 'amd/circleDependency/d' 
                        && a.check() && d.check();
            }
        };
    }
);