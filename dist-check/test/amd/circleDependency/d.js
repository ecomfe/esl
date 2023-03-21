define( 
    'amd/circleDependency/d',
    [ 'amd/circleDependency/e' ],
    function ( e ) {
        return {
            name: 'amd/circleDependency/d',
            check: function () {
                return e.name == 'amd/circleDependency/e' && e.check();
            }
        };
    }
);