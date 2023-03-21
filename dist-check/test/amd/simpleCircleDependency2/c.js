define(
    function ( require ) {
        var index = require( './index' );
        return {
            name: 'amd/simpleCircleDependency2/c',
            check: function () {
                return index.name == 'amd/simpleCircleDependency2/index';
            }
        };
    }
);