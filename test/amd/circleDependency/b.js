define( 
    'amd/circleDependency/b',
    [ 'amd/circleDependency/a', 'amd/circleDependency/c' ],
    function ( a, c ) {
        return {
            name: 'amd/circleDependency/b',
            check: function () {
                var a = require( 'amd/circleDependency/a' );
                return a.name == 'amd/circleDependency/a' 
                        && c.name == 'amd/circleDependency/c' && c.check();
            }
        };
    }
);