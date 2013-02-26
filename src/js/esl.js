/**
 * @file ECOMFE标准加载器，符合AMD规范
 * @author errorrik(errorrik@gmail.com)
 */

// TODO: 整理代码
// TODO: IE性能优化
// TODO: 支持map配置

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
                require : createLocalRequire( id ),
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
            mod_fireDefined( id );
        }
    }

    function createLocalRequire( baseId ) {
        var normalize = getNormalizer( baseId );
        function req( requireId, callback ) {
            return require( normalize( requireId ), callback, baseId );
        }

        req.toUrl = function ( name ) {
            return toUrl( name, baseId );
        };

        return req;
    }

    function mod_fireDefined( id ) {
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
        if ( mod_exists( id ) ) {
            return mod_definedModule[ id ].exports;
        }

        return null;
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

    function parseId( id ) {
        var match = /^([-_a-z0-9\.]+(\/[-_a-z0-9\.]+)*)(!.*)?$/i.exec ( id );
        if ( match && match.length > 0 ) {
            var resourceId = match[ 3 ] ? match[ 3 ].slice( 1 ) : '';
            return {
                module   : match[ 1 ],
                resource : resourceId
            };
        }

        debugger
    }

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
        var defines = currentScriptDefines.slice( 0 );
        var requireModules = [];
        var pluginModules = [];

        function isInAfterDefine( startIndex, dependId ) {
            var len = defines.length;
            for ( ; startIndex < len; startIndex++ ) {
                var defineId = defines[ startIndex ].id;
                if ( dependId == ( defineId || currentId ) ) {
                    return 1;
                }
            }

            return 0;
        }

        each(
            defines,
            function ( defineItem, defineIndex ) {
                var id = defineItem.id || currentId;
                var depends = defineItem.deps;
                var factory = defineItem.factory;
                var normalize = getNormalizer( id );
                
                if ( mod_getDefining( id ) || mod_exists( id ) ) {
                    return;
                }

                // 处理define中编写的依赖声明
                // 默认为['require', 'exports', 'module']
                if ( !(depends instanceof Array) || depends.length == 0 ) {
                    depends = [ 'require', 'exports', 'module' ];
                }
                defineItem.deps = depends;

                // 处理实际需要加载的依赖
                var realDepends = [];
                defineItem.realDeps = realDepends;
                realDepends.push.apply( realDepends, depends );

                // 分析function body中的require
                if ( typeof factory == 'function' ) {
                    var match;
                    var factoryBody = factory.toString();
                    var requireRule = /require\(\s*(['"'])([^'"]+)\1\s*\)/g
                    while ( ( match = requireRule.exec( factoryBody ) ) ) {
                        realDepends.push( match[ 2 ] );
                    }
                }

                // 分析resource加载的plugin module id
                each(
                    realDepends,
                    function ( dependId ) {
                        var idInfo = parseId( dependId );
                        if ( idInfo.resource ) {
                            pluginModules.push( normalize( idInfo.module ) );
                        }
                    }
                );
            }
        );

        function pretreatAndDefine() {
            each(
                defines,
                function ( defineItem, defineIndex ) {
                    var id = defineItem.id || currentId;
                    var depends = defineItem.deps;
                    var realDepends = defineItem.realDeps;
                    var normalize = getNormalizer( id );

                    // 对参数中声明的依赖进行normalize
                    var len = depends.length;
                    while ( len-- ) {
                        depends[ len ] = normalize( depends[ len ] );
                    }

                    // 依赖模块id normalize化，并去除必要的依赖。去除的依赖模块有：
                    // 1. 内部模块：require/exports/module
                    // 2. 重复模块：dependencies参数和内部require可能重复
                    // 3. 空模块：dependencies中使用者可能写空
                    // 4. 在当前script中，被定义在后续代码中的模块
                    // 5. 循环依赖模块
                    var len = realDepends.length;
                    var existsDepend = {};
                    while ( len-- ) {
                        var dependId = normalize( realDepends[ len ] );
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
                    mod_define( id, depends, realDepends, defineItem.factory );
                }
            );

            require( requireModules, new Function() );
        }
        
        if ( pluginModules.length ) {
            require( pluginModules, pretreatAndDefine );
        }
        else {
            pretreatAndDefine();
        }

        currentScriptDefines.length = 0;
        currentScriptDefines = [];


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
     * @return {Object}
     */
    function require( moduleId, callback ) {
        if ( typeof moduleId == 'string' ) {
            if ( !mod_exists( moduleId ) ) {
                throw { message: moduleId + ' is not exists!' };
            }

            return mod_get( moduleId );
        }

        if ( !( moduleId instanceof Array ) || moduleId.length == 0 ) {
            return;
        }

        callback = callback || new Function();
        var baseId = arguments[ 2 ] || '';
        each(
            moduleId,
            function ( id ) {
                mod_addDefinedListener( id, tryFinishRequire );
                if ( id.indexOf( '!' ) > 0 ) {
                    loadPlugin( id, baseId );
                }
                else {
                    loadModule( id, baseId );
                }
            }
        );

        /**
         * 尝试完成require，调用callback
         * 在模块与其依赖模块都加载完时调用
         * 
         * @inner
         */
        function tryFinishRequire() {
            var allDefined = 1;
            var callbackArgs = [];
            each(
                moduleId,
                function ( id ) {
                    var module = mod_get( id );
                    if ( module == null ) {
                        allDefined = 0;
                        return false;
                    }

                    callbackArgs.push( module )
                }
            );

            if ( allDefined ) {
                callback.apply( global, callbackArgs );
            }
        }

        tryFinishRequire();
    }

    require.toUrl = function ( name ) {
        return toUrl( name, '' );
    };

    function toUrl( name, baseId ) {
        if ( /^\.{1,2}/.test( name ) ) {
            var basePath = baseId.split( '/' );
            var namePath = name.split( '/' );
            var baseLen = basePath.length - 1;
            var nameLen = namePath.length;
            var cutBaseTerms = 0;
            var cutNameTerms = 0;


            pathLoop: for ( var i = 0; i < nameLen; i++ ) {
                var term = namePath[ i ];
                switch ( term ) {
                    case '..':
                        if ( cutBaseTerms < baseLen - 1 ) {
                            cutBaseTerms++;
                            cutNameTerms++;
                        }
                        else {
                            break pathLoop;
                        }
                        break;
                    case '.':
                        cutNameTerms++;
                        break;
                    default:
                        break pathLoop;
                }
            }

            basePath.length = baseLen - cutBaseTerms;
            namePath = namePath.slice( cutNameTerms );

            basePath.push.apply( basePath, namePath );
            return requireConf.baseUrl + basePath.join( '/' );
        }

        return name;
    };

    define.amd = {
        multiversion: true
    };
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
        // TODO: 解决ie10的重复触发问题
        var script = getDocument().createElement( 'script' );
        script.setAttribute( 'data-require-id', moduleId );
        script.src = id2Path( moduleId );
        script.async = true;
        script.onreadystatechange = script.onload = loadedListener;

        appendScript( script );
    }

    function mod_addPluginResource( pluginId, exports ) {console.log( pluginId)
        mod_definedModule[ pluginId ] = {
            exports: exports || true
        };

        mod_fireDefined( pluginId );
    }

    function loadPlugin( pluginId, baseId ) {
        var separatorIndex = pluginId.indexOf( '!' );
        var pluginModuleId = pluginId.slice( 0, separatorIndex );
        var resourceId = pluginId.slice( separatorIndex + 1 );
        var plugin = mod_get( pluginModuleId );

        function loadResource( plugin ) {
            plugin.load( 
                resourceId, 
                createLocalRequire( baseId ),
                function ( value ) {
                    mod_addPluginResource( pluginId, value );
                }
            );
        }

        if ( !plugin ) {
            require( [ pluginModuleId ], loadResource ); 
        }
        else {
            loadResource( plugin );
        }
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
            var scripts = getDocument().getElementsByTagName( 'script' );
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

    
    function getNormalizer( baseId ) {

        function normalize( id ) {
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

        return function ( id ) {
            var idInfo = parseId( id );
            var moduleId = normalize( idInfo.module );
            var resourceId = idInfo.resource;
            if ( resourceId ) {
                var module = mod_get( moduleId );
                resourceId = module.normalize
                    ? module.normalize( resourceId, normalize )
                    : normalize( resourceId );
                
                return moduleId + '!' + resourceId;
            }

            return moduleId;
        };
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

    var requireConf = { 
        baseUrl : './',
        paths   : {},
        config  : {},
        map     : {}
    };

    require.config = function ( conf ) {
        // 原先采用force和deep的mixin方案
        // 后来考虑到如果使用者将require.config写在多个地方
        // 打包分析需要考虑合并以及合并顺序问题，比较混乱
        // 又回归最简单的对象拷贝方案实现
        for ( var key in conf ) {
            if ( conf.hasOwnProperty( key ) ) {
                requireConf[ key ] = conf[ key ];
            }
        }
    };

    function id2Path( id ) {
        var path = id;
        for ( var key in requireConf.paths ) {
            if ( isPrefix( key, id ) ) {
                path = id.replace( key, requireConf.paths[ key ] );
            }
        }

        if ( !/^([a-z]{3,8}:)?\//.test( path ) ) {
            path = requireConf.baseUrl + path;
        }
        return path + '.js';
    }

    function isPrefix( prefix, id ) {
        var prefixTerms = prefix.split( '/' );
        var idTerms = id.split( '/' );
        var len = prefixTerms.length;

        if ( len > idTerms.length ) {
            return 0;
        }

        for ( var i = 0; i < len; i++ ) {
            if ( prefixTerms[ i ] != idTerms[ i ] ) {
                return 0;
            }
        }

        return 1;
    }
})( this );
