define( 
    [ 
        './a',
        'require'
    ], 
    function ( a, require ) {
        var aname = a.name;
        return {
            name: 'amd/hardCircleDependency/b',
            check: function () {
                var valid = aname == 'amd/hardCircleDependency/a';
                return valid;
            }
        };
    }
);