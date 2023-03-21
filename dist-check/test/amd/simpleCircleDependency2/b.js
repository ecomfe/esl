define(
    function ( require ) {
        return {
            name: 'amd/simpleCircleDependency2/b',
            check: function () {
                var c = require( './c' );
                return c.name == 'amd/simpleCircleDependency2/c' && c.check();
            }
        };
    }
);