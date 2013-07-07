define( 
    'amd/circleDependency/b',
    [ 'require', 'amd/circleDependency/c', 'amd/circleDependency/a' ],
    function ( require, c ) {
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