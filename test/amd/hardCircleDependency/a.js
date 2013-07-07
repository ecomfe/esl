define( 
    [ 
        
        'require', './b'
    ], 
    function ( require ) {
        return {
            name: 'amd/hardCircleDependency/a',
            check: function () {
                var b = require( './b' );
                var valid = b.name == 'amd/hardCircleDependency/b' && b.check();
                return valid;
            }
        };
    }
);