define( 
    'amd/combineplugin/cat',
    function ( require ) {
        return {
            name: 'amd/combineplugin/cat'
        };
    }
);

define( 'plugin/html2',
    {
        load: function ( resourceId, req, load, config ) {
            var xhr = window.XMLHttpRequest
                ? new XMLHttpRequest()
                : new ActiveXObject("Microsoft.XMLHTTP");

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    load( xhr.responseText );
                }
            };
            xhr.open('GET', req.toUrl( resourceId ) + '.html', true);
            xhr.send(null);
        }
    } 
);

define( 
    'amd/combineplugin/index', 
    [ 
        'amd/combineplugin/cat',
        'plugin/html2!plugin/resource'
    ], 
    function ( cat, resource ) {

        return {
            name: 'amd/combineplugin/index',
            check: function () {
                var valid = 
                    cat.name == 'amd/combineplugin/cat'
                    && resource == 'plugin/html!plugin/resource'
                return valid;
            }
        };
    }
);



