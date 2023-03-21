define(['require', './a', './text!./index-text'], 
    function (require) {
        var a = require('./a');
        var text = require('./text!./index-text');
        return {
            name: 'amd/combineplugin3/index',
            check: function () {
                return a.name === 'amd/combineplugin3/a'
                    && a.check()
                    && text === 'amd/combineplugin3/text!amd/combineplugin3/index-text';
            }
        };
    }
);

define('amd/combineplugin3/text!amd/combineplugin3/index-text', 'amd/combineplugin3/text!amd/combineplugin3/index-text')

define('amd/combineplugin3/text!amd/combineplugin3/a-text', 'amd/combineplugin3/text!amd/combineplugin3/a-text')

define('amd/combineplugin3/a', ['require', './text!./a-text'], 
    function (require) {
        var text = require('./text!./a-text');
        return {
            name: 'amd/combineplugin3/a',
            check: function () {
                return text === 'amd/combineplugin3/text!amd/combineplugin3/a-text';
            }
        };
    }
);

define('amd/combineplugin3/text', {});
