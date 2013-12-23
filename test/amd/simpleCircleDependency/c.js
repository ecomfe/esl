define(
    function ( require ) {
        return {
            name: 'amd/simpleCircleDependency/c',
            check: function () {
                var index = require( './index' );
                return index.name == 'amd/simpleCircleDependency/index';
            }
        };
    }
);