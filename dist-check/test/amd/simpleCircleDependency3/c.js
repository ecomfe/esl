define(
    function ( require ) {
        var index = require( './index' );
        return {
            name: 'amd/simpleCircleDependency3/c',
            check: function () {
                return index.name == 'amd/simpleCircleDependency3/index';
            }
        };
    }
);