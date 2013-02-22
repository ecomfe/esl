define( 
    'amd/deepDependency/level3', 
    [ 
        'amd/deepDependency/level4'
    ], 
    {
        name: 'amd/deepDependency/level3',
        check: function () {
            var level4 = require( 'amd/deepDependency/level4' );
            var valid = 
                level4.name == 'amd/deepDependency/level4'
                && level4.check();
                
            return valid;
        }
    }
);