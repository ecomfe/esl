/*
      index --->>--- b --->>--- c --->>--- g --->>--- h -->--
        \           /          / \                          /
         \         /          /   \                        /
          \        -<<-- d --<     ----<<---- j ---<<--- i
           \              \
            \              \
             -<<-- e --<<---
*/


define( 
    function ( require ) {
        var b = require( './b' );
        return {
            name: 'amd/complexCircleDependency3/index',
            check: function () {
                var valid = 
                    b.name == 'amd/complexCircleDependency3/b'
                    && b.check();
                return valid;
            }
        };
    }
);