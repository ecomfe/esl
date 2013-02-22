define( 
    'amd/deepDependency/level22', 
    [ 
        'amd/deepDependency/level3'
    ], 
    function ( level3 ) {
        return {
            name: 'amd/deepDependency/level22',
            check: function () {
                var valid = 
                    level3.name == 'amd/deepDependency/level3'
                    && level3.check();
                    
                return valid;
            }
        };
    }
);