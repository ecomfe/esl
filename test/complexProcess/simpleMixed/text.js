
define(
    {
        load: function (id, require, load) {
            setTimeout(function () {
                load('complexProcess/simpleMixed/text!' + id)
            }, 100);
        }
    }
);
