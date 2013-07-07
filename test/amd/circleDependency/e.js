define( 
    'amd/circleDependency/e',
    [ 'require', 'amd/circleDependency/d' ],
    function ( require ) {
        return {
            name: 'amd/circleDependency/e',
            check: function () {
                var d = require( 'amd/circleDependency/d' );
                return d.name == 'amd/circleDependency/d';
            }
        };
    }
);