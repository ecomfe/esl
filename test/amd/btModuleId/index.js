define(
    function ( require ) {
        var hasDot = require( './has.dot' );
        
        return {
            name: 'amd/btModuleId/index',
            check: function () {
                return hasDot.name == 'amd/btModuleId/has.dot'
            }
        };
    }
);