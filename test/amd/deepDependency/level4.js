define( 
    'amd/deepDependency/level4', 
    [ 
        'amd/deepDependency/level5'
    ], 
    function ( level5 ) {
        return {
            name: 'amd/deepDependency/level4',
            check: function () {
                var valid = level5.name == 'amd/deepDependency/level5';
                    
                return valid;
            }
        };
    }
);