define(
    function ( require ) {
        var c = require( './c' );
        return {
            name: 'amd/simpleCircleDependency3/b',
            check: function () {
                return c.name == 'amd/simpleCircleDependency3/c' && c.check();
            }
        };
    }
);