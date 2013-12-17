define( 
    function ( require ) {
        return {
            name: 'amd/complexCircleDependency/h2',
            check: function () {
                var s1 = require( './s1' );
                var valid = 
                    s1.name == 'amd/complexCircleDependency/s1'
                    && s1.check();
                return valid;
            }
        };
    }
);