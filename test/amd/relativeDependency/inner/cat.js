define( 
	[ '../dog' ],
    function ( dog ) {
        return {
            name: 'amd/relativeDependency/inner/cat',
            check: function () {
                return dog.name == 'amd/relativeDependency/dog'
            }
        };
    }
);