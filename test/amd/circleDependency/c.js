define( 
    'amd/circleDependency/c',
    [ 'amd/circleDependency/a' ],
    function ( a ) {
        return {
            name: 'amd/circleDependency/c',
            check: function () {
                var a = require( 'amd/circleDependency/a' );
                return a.name == 'amd/circleDependency/a';
            }
        };
    }
);