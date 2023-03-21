define( 
    [ 
        './a'
    ], 
    function ( a ) {
        return {
            name: 'amd/hardCircleDependency/index',
            check: function () {
                var valid = 
                    a.name == 'amd/hardCircleDependency/a'
                    && a.check();
                return valid;
            }
        };
    }
);