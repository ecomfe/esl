define(
    function ( require ) {
        var c = require( './c' );
        return {
            name: 'amd/simpleCircleDependency/b',
            check: function () {
                return c.name == 'amd/simpleCircleDependency/c' && c.check();
            }
        };
    }
);