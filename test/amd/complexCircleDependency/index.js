/*
      index --->>--- a --->>--- b --->>--- c --->>--- d --->>--- e
                      \                     \                   /
                       \                     \                 /
                        \                     ----<<--- f --<--
                         \                             /
                          \                           /
                           ----<<---- g ----- << -----
*/

define(['./a'],function(a){
    return {
        name: 'amd/complexCircleDependency/index',
        check: function () {
            return a.name == 'a';
        }
    }
})