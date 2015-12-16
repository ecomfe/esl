define(
    function (require) {
        require('./c').name;
        require('./g').name;
        return {name: 'f'};
    }
);
