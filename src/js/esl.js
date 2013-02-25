/**
 * @file ECOMFE标准加载器，符合AMD规范
 * @author errorrik(errorrik@gmail.com)
 */

// TODO: sweep code


var define;
var require;

(function ( global ) {
    // "mod_"开头的变量或函数为内部模块管理函数
    // 为提高压缩率，不使用function或object包装
    
    /**
     * 已定义模块容器
     * 
     * @inner
     * @type {Object}
     */
    var mod_definedModule = {};

    /**
     * 定义中模块容器
     * 
     * @inner
     * @type {Object}
     */
    var mod_definingModule = {};

    /**
     * 模块添加事件监听器
     * 
     * @inner
     * @type {Object.<Array>}
     */
    var mod_definedListener = {};

    /**
     * 定义模块
     * 
     * @param {string} id 模块标识
     */
    function mod_define( id, factoryModules, dependencies, factory ) {
        var module = {
            id           : id,
            dependencies : dependencies,
            factory      : factory,
            exports      : {}
        };

        mod_definingModule[ id ] = module;

        if ( isReady() ) {
            initModule();
        } else {
            each( dependencies, function ( dependId ) {
                mod_addDefinedListener( dependId, tryInitModule );
            } );
        }

        function tryInitModule() {
            if ( isReady() ) {
                initModule();
            }
        }

        function isReady() {
            var len  = dependencies.length;
            while ( len-- ) {
                var dependId = dependencies[ len ];
                if ( !mod_exists( dependId ) ) {
                    return false;
                }
            }

            return true;
        }

        function initModule() {
            // 构造factory参数
            var buildinModule = {
                require : function ( requireId, callback ) {
                    return require( normalize( requireId, id ), callback )
                },
                exports : module.exports,
                module  : module
            };
            var len  = factoryModules.length;
            var args = [];

            while ( len-- ) {
                var moduleId = factoryModules[ len ];
                args[ len ] = buildinModule[ moduleId ]
                    || mod_get( moduleId );
            }

            // 调用factory函数初始化module
            var exports = typeof factory == 'function'
                ? factory.apply( global, args )
                : factory;

            if ( typeof exports != 'undefined' ) {
                module.exports = exports;
            }

            // 存储已定义模块
            mod_definedModule[ id ] = module;
            delete mod_definingModule[ id ];

            // 触发defined事件
            var listeners = mod_definedListener[ id ];
            var len = listeners instanceof Array && listeners.length;
            
            if ( len ) {
                for ( var i = 0; i < len; i++ ) {
                    listeners[ i ]();
                }
                listeners.length = 0;
            }

            // 进行listener清理
            delete mod_definedListener[ id ];
        }
    }

    /**
     * 判断模块是否存在
     * 
     * @param {string} id 模块标识
     * @return {boolean}
     */
    function mod_exists( id ) {
        return id in mod_definedModule;
    }

    /**
     * 获取模块
     * 
     * @param {string} id 模块标识
     * @return {Object}
     */
    function mod_get( id ) {
        return mod_definedModule[ id ] && mod_definedModule[ id ].exports;
    }

    /**
     * 添加“模块添加”事件监听器
     * 
     * @param {string} id 模块标识
     * @param {Function} listener 监听器
     */
    function mod_addDefinedListener( id, listener ) {
        if ( mod_exists( id ) ) {
            return;
        }

        var listeners = mod_definedListener[ id ];
        if ( !(listeners instanceof Array) ) {
            listeners = mod_definedListener[ id ] = [];
        }

        listeners.push( listener );
    }

    /**
     * 获取正在定义中模块
     * 
     * @param {string} id 模块标识
     * @return {Object}
     */
    function mod_getDefining( id ) {
        return mod_definingModule[ id ];
    }

    /**
     * 当前script中的define集合
     * 
     * @inner
     * @type {Array}
     */
    var currentScriptDefines = [];

    var BUILDIN_MODULE = {
        require : 1,
        exports : 1,
        module  : 1
    };

    /**
     * 定义模块
     * 
     * @param {string=} id 模块标识
     * @param {Array=} dependencies 依赖模块列表
     * @param {Function=} factory 创建模块的工厂方法
     */
    function define() {
        var id;
        var dependencies;
        var factory;

        var args = Array.prototype.slice.call( arguments );


        while ( args.length > 0 ) {
            var arg = args.shift();
            var type = typeof arg;

            switch ( type ) {
                case 'string':
                    id = arg;
                    break;
                case 'function':
                    factory = arg;
                    break;
                case 'object':
                    if ( !dependencies && arg instanceof Array ) {
                        dependencies = arg;
                    }
                    else {
                        factory = arg;
                    }
                    break;
            }
        }
        
        if ( !id && getDocument().attachEvent && (!isOpera()) ) {
            id = getCurrentScript().getAttribute( 'data-require-id' );
        }

        currentScriptDefines.push( {
            id      : id,
            deps    : dependencies,
            factory : factory
        } );
    }

    /**
     * 完成模块定义
     * 
     * @inner
     */
    function completeDefine( currentId ) {
        var requireModules = [];
        
        each(
            currentScriptDefines,
            function ( defineItem, defineIndex ) {
                var id = defineItem.id || currentId;
                var depends = defineItem.deps;
                var factory = defineItem.factory;
                
                if ( mod_getDefining( id ) || mod_exists( id ) ) {
                    return;
                }

                // 处理依赖声明
                // 未包含dependencies参数时，默认为['require', 'exports', 'module']
                if ( !(depends instanceof Array) || depends.length == 0 ) {
                    depends = [ 'require', 'exports', 'module' ];
                }
                var len = depends.length;
                while ( len-- ) {
                    depends[ len ] = normalize( depends[ len ], id );
                }

                // 处理实际需要加载的依赖
                var realDepends = [];
                realDepends.push.apply( realDepends, depends );

                // 分析function body中的require
                if ( typeof factory == 'function' ) {
                    var matches;
                    var factoryBody = factory.toString();
                    var requireRule = /require\(\s*(['"'])([^'"]+)\1\s*\)/g
                    while ( ( matches = requireRule.exec( factoryBody ) ) ) {
                        realDepends.push( matches[ 2 ] );
                    }
                }

                // id normalize化，并去除依赖模块。去除的依赖模块有：
                // 1. 内部模块：require/exports/module
                // 2. 重复模块：dependencies参数和内部require可能重复
                // 3. 空模块：dependencies中使用者可能写空
                // 4. 在当前script中，被定义在后续代码中的模块
                // 5. 循环依赖模块
                var len = realDepends.length;
                var existsDepend = {};
                while ( len-- ) {
                    var dependId = normalize( realDepends[ len ], id );
                    if ( !dependId
                         || dependId in existsDepend
                         || dependId in BUILDIN_MODULE
                         || isInAfterDefine( defineIndex + 1, dependId )
                         || isInDependencyChain( id, dependId )
                    ) {
                        realDepends.splice( len, 1 );
                    }
                    else {
                        existsDepend[ dependId ] = 1;
                        realDepends[ len ] = dependId;
                    }
                }

                // 将实际依赖压入加载序列中，后续统一进行require
                requireModules.push.apply( requireModules, realDepends );
                mod_define( id, depends, realDepends, factory );

                function isInAfterDefine( startIndex, dependId ) {
                    var len = currentScriptDefines.length;
                    for ( ; startIndex < len; startIndex++ ) {
                        var defineId = currentScriptDefines[ startIndex ].id;
                        if ( dependId == ( defineId || currentId ) ) {
                            return 1;
                        }
                    }

                    return 0;
                }
            }
        );
        
        currentScriptDefines.length = 0;
        currentScriptDefines = [];
        
        require( requireModules, new Function() );


        function isInDependencyChain( source, target ) {
            var module = mod_getDefining( target ) || mod_get( target );
            var depends = module && module.dependencies;

            if ( depends ) {
                var len = depends.length;

                while ( len-- ) {
                    var dependName = depends[ len ];
                    if ( source == dependName
                         || isInDependencyChain( source, dependName ) ) {
                        return true;
                    }
                }
            }
            return false;
        }
    }

    /**
     * 获取模块
     * 
     * @param {string|Array} moduleId 模块名称或模块名称列表
     * @param {Function=} callback 获取模块完成时的回调函数
     * @return {Object} 如果模块没ready需要下载，则返回null
     */
    function require( moduleId, callback ) {
        var ids;
        if ( typeof moduleId == 'string' ) {
            ids = [ moduleId ];
        }
        else if ( moduleId instanceof Array ) {
            ids = moduleId.slice( 0 );
        }

        if ( !ids ) {
            return null;
        }

        var idLen = ids.length;
        var moduleLoaded = new Array( idLen );
        for ( var i = 0; i < idLen; i++ ) {
            var id = ids[ i ];
            if ( mod_exists( id ) ) {
                moduleLoaded[ i ] = 1;
            }
            else {
                moduleLoaded[ i ] = 0;
                mod_addDefinedListener( id, getModuleAddListener( i ) );
                loadModule( id );
            }
        }

        finishRequire();
        return mod_get( ids[ 0 ] ) || null;

        /**
         * 获取模块添加完成的事件监听器
         * 
         * @inner
         * @param {number} index 模块在依赖数组中的索引
         * @return {Function}
         */
        function getModuleAddListener( index ) {
            return function () { 
                moduleLoaded[ index ] = 1;
                finishRequire();
            };
        }

        /**
         * 完成require，调用callback
         * 在模块与其依赖模块都加载完时调用
         * 
         * @inner
         */
        function finishRequire() {
            var allModuleReady = 1;
            for ( var i = 0; i < idLen; i++ ) {
                allModuleReady = allModuleReady && moduleLoaded[ i ];
            }

            if ( allModuleReady && typeof callback == 'function' ) {
                var callbackArgs = [];
                for ( var i = 0; i < idLen; i++ ) {
                    callbackArgs.push( mod_get( ids[ i ] ) );
                }

                callback.apply( this, callbackArgs );
            }
        }
    }

    global.define = define;
    global.require = require;

    /**
     * 正在加载的模块列表
     * 
     * @inner
     * @type {Object}
     */
    var loadingModules = {};

    /**
     * 加载模块
     * 
     * @inner
     * @param {string} moduleId 模块标识
     */
    function loadModule( moduleId ) {
        if ( mod_exists( moduleId ) 
             || mod_getDefining( moduleId )
             || loadingModules[ moduleId ]
        ) {
            return;
        }
        
        function loadedListener( evt ) {
            var readyState = script.readyState;
            if ( typeof readyState == 'undefined'
                 || /^(loaded|complete)$/.test( readyState )
            ) {
                script.onload = script.onreadystatechange = null;

                completeDefine( moduleId );
                delete loadingModules[ moduleId ];
                script = null;
            }
        }

        loadingModules[ moduleId ] = 1;

        // create script element
        var script = getDocument().createElement( 'script' );
        script.setAttribute( 'data-require-id', moduleId );
        script.src = getURL( moduleId );
        script.async = true;
        script.onreadystatechange = script.onload = loadedListener;

        appendScript( script );
    }

    // 感谢requirejs，通过currentlyAddingScript兼容老旧ie
    // 
    // For some cache cases in IE 6-8, the script executes before the end
    // of the appendChild execution, so to tie an anonymous define
    // call to the module name (which is stored on the node), hold on
    // to a reference to this node, but clear after the DOM insertion.
    var currentlyAddingScript;
    var interactiveScript;

    /**
     * 获取当前script标签
     * 用于ie下define未指定module id时获取id
     * 
     * @inner
     * @return {HTMLDocument}
     */
    function getCurrentScript() {
        if ( currentlyAddingScript ) {
            return currentlyAddingScript;
        }
        else if ( 
            interactiveScript 
            && interactiveScript.readyState == 'interactive'
        ) {
            return interactiveScript;
        }
        else {
            var scripts = getDocument().getElementsByTagName('script');
            var scriptLen = scripts.length;
            while ( scriptLen-- ) {
                var script = scripts[ scriptLen ];
                if ( script.readyState == 'interactive' ) {
                    interactiveScript = script;
                    return script;
                }
            }
        }
    }

    /**
     * 向页面中插入script标签
     * 
     * @inner
     * @param {HTMLScriptElement} script script标签
     */
    function appendScript( script ) {
        currentlyAddingScript = script;

        var doc = getDocument();
        var parent = doc.getElementsByTagName( 'head' ) [ 0 ] || doc.body;
        parent.appendChild( script );
        
        currentlyAddingScript = null;
    }

    

    function normalize( id, baseId ) {
        if ( /^\./.test( id ) ) {
            var terms = baseId.split( '/' );
            terms.length = terms.length - 1;

            each( 
                id.split( '/' ), 
                function ( item ) {
                    switch( item ) {
                        case '..':
                            terms.splice( terms.length - 1, 1 );
                            break;
                        case '.':
                            break;
                        default:
                            terms.push( item );
                    }
                }
            );

            return terms.join( '/' );
        }

        return id;
    }

    /**
     * 循环遍历数组集合
     * 
     * @inner
     * @param {Array} source 数组源
     * @param {function(Array,Number):boolean} iterator 遍历函数
     */
    function each( source, iterator ) {
        for ( var i = 0, len = source.length; i < len; i++ ) {
            if ( iterator( source[ i ], i ) === false ) {
                break;
            }
        }
    }

    /**
     * 获取document对象
     * 
     * @inner
     * @return {HTMLDocument}
     */
    function getDocument() {
        return global.document;
    }

    /**
     * 判断是否opera
     * 
     * @inner
     * @return {boolean}
     */
    function isOpera() {
        return global.opera && global.opera.toString() === '[object Opera]';
    }

    function forceMixin( target, source ) {
        for ( var key in source ) {
            if ( source.hasOwnProperty( key ) ) {
                var value = source[ key ];
                var targetValue = target[ key ];

                switch ( typeof value ) {
                    case 'number':
                    case 'string':
                    case 'boolean':
                        target[ key ] = value;
                        break;
                    default: 
                        if ( value instanceof Array ) {
                            if ( !(targetValue instanceof Array) ) {
                                target[ key ] = targetValue = [];
                            }

                            targetValue.push.apply( targetValue, value );
                        }
                        else {
                            forceMixin( targetValue, value );
                        }
                }
            }
        }
    }

    // TODO: comform require spec[ https://github.com/amdjs/amdjs-api/wiki/require ]
    var requireConf = { 
        baseUrl : './',
        paths   : {} 
    };

    require.config = function ( conf ) {
        forceMixin( requireConf, conf );
    };

    function getURL( id ) {
        return requireConf.baseUrl + id + '.js';
    }
})( this );

