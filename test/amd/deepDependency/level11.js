define( 
    'amd/deepDependency/level11', 
    [ 
        'amd/deepDependency/level22', 
        'amd/deepDependency/level23'
    ], 
    function ( level22, level23 ) {
        return {
            name: 'amd/deepDependency/level11',
            check: function () {
                var valid = 
                    level22.name == 'amd/deepDependency/level22'
                    && level23.name == 'amd/deepDependency/level23'
                    && level22.check()
                    && level23.check();
                    
                return valid;
            }
        };
    }
);