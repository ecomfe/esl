define(
    function (require) {
        require('./b').name;
        return {name: 'a'};
    }
);
