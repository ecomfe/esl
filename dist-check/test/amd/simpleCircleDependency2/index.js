/*
      index --->>--- b --->--- c
        \                     /
         \                   /
           --------<<-------
*/


define(
    function ( require ) {
        var b = require( './b' );
        return {
            name: 'amd/simpleCircleDependency2/index',
            check: function () {
                return b.name == 'amd/simpleCircleDependency2/b' && b.check();
            }
        };
    }
);