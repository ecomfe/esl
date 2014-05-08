define( function ( require ) {
    return {
        name: 'amd/deepDependency2/level4',
        check: function () {
            var level5 = require( './level5' );
            var valid =
                level5.name == 'amd/deepDependency2/level5'
            return valid;
        }
    };
})
