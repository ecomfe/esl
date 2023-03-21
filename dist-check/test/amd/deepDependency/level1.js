define( 
    'amd/deepDependency/level1', 
    [ 
        'amd/deepDependency/level2', 
        'amd/deepDependency/level21'
    ], 
    function ( level2, level21 ) {
        return {
            name: 'amd/deepDependency/level1',
            check: function () {
                var valid = 
                    level2.name == 'amd/deepDependency/level2'
                    && level21.name == 'amd/deepDependency/level21';
                    
                return valid;
            }
        };
    }
);