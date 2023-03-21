define( 
	[ '../dog' ],
    function ( dog ) {
        return {
            name: 'cjs/relativeDependency/inner/cat',
            check: function () {
                return dog.name == 'cjs/relativeDependency/dog'
            }
        };
    }
);