define(
    function (require) {
        require('./b').name;
        require('./h').name;
        return {name: 'index'};
    }
);
