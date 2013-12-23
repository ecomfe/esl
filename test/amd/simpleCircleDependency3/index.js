/*
      index --->--- b --->>--- c
        \                     /
         \                   /
           --------<<-------
*/


define(
    function ( require ) {
        return {
            name: 'amd/simpleCircleDependency3/index',
            check: function () {
                var b = require( './b' );
                return b.name == 'amd/simpleCircleDependency3/b' && b.check();
            }
        };
    }
);