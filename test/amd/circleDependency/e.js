define( 
    'amd/circleDependency/e',
    [ 'amd/circleDependency/d' ],
    function ( d ) {
        return {
            name: 'amd/circleDependency/e',
            check: function () {
                var d = require( 'amd/circleDependency/d' );
                return d.name == 'amd/circleDependency/d';
            }
        };
    }
);