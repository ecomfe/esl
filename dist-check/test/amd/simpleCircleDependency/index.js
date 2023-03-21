/*
      index --->>--- b --->>--- c
        \                      /
         \                    /
           ---------<--------
*/

define(
    function ( require ) {
        var b = require( './b' );
        return {
            name: 'amd/simpleCircleDependency/index',
            check: function () {
                return b.name == 'amd/simpleCircleDependency/b' && b.check();
            }
        };
    }
);