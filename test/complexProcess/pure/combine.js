define(
    'complexProcess/pure/bar', 
    ['require', 'complexProcess/pure/text'], 
    function (require) {
        return {
            name: 'complexProcess/pure/bar',
            text: require('complexProcess/pure/text')
        };
    }
);


define(
    'complexProcess/pure/text', 
    [], 
    {
        name: 'complexProcess/pure/text'
    }
);
