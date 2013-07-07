define(['./a'],function(a){
    return {
        name: 'amd/circleDependency2/index',
        check: function () {
            return a.name == 'a';
        }
    }
})