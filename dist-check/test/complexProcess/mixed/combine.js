define(
    'complexProcess/mixed/bar', 
    ['require', 'complexProcess/mixed/text!x'], 
    function (require) {
        return {
            name: 'complexProcess/mixed/bar',
            res: require('complexProcess/mixed/text!x')
        };
    }
);


define(
    'complexProcess/mixed/text', 
    [], 
    {
        load: function (id, require, load) {
            setTimeout(function () {
                load('complexProcess/mixed/text!' + id)
            }, 100);
        }
    }
);
