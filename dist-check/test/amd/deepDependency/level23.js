define( 
    'amd/deepDependency/level23', 
    [ 
        'amd/deepDependency/level31'
    ], 
    function ( level31 ) {
        return {
            name: 'amd/deepDependency/level23',
            check: function () {
                var valid = 
                    level31.name == 'amd/deepDependency/level31';
                    
                return valid;
            }
        };
    }
);