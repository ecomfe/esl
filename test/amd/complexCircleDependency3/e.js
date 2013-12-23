define( 
    function ( require ) {
        var index = require( './index' );
        return {
            name: 'amd/complexCircleDependency3/e',
            check: function () {
                var valid = 
                    index.name == 'amd/complexCircleDependency3/index';
                return valid;
            }
        };
    }
);