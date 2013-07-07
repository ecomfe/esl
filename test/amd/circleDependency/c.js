define( 
    'amd/circleDependency/c',
    [ 'require', 'amd/circleDependency/a' ],
    function ( require ) {
        return {
            name: 'amd/circleDependency/c',
            check: function () {
                var a = require( 'amd/circleDependency/a' );
                return a.name == 'amd/circleDependency/a';
            }
        };
    }
);