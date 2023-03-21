define(
    function (require) {
        return {
            name: 'complexProcess/pure/index',
            text: require('complexProcess/pure/text'),
            bar: require('./bar')
        };
    }
);
