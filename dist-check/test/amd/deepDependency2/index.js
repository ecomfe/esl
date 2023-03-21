define( function ( require ) {
    return {
        name: 'amd/deepDependency2/index',
        check: function () {
            var level1 = require( './level1' );
            var level2 = require( './level2' );
            var valid =
                level1.name == 'amd/deepDependency2/level1'
                && level1.check()
                && level2.name == 'amd/deepDependency2/level2'
                && level2.check()
            return valid;
        }
    };
})
