define(
    function (require) {
        return {
            name: 'complexProcess/mixed/index',
            res: require('complexProcess/mixed/text!x'),
            bar: require('./bar')
        };
    }
);
