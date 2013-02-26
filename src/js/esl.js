/**
 * @file ECOMFE标准加载器，符合AMD规范
 * @author errorrik(errorrik@gmail.com)
 */

// TODO: 整理代码
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
     * @inner
     * @param {string} id 模块标识
     */
    function mod_define( id, factoryModules, dependencies, factory ) {
        var module = {
            id           : id,
            dependencies : dependencies,
            factory      : factory,
            exports      : {}
        };

        // 将模块预存入defining集合中
        mod_definingModule[ id ] = module;

        if ( isDependencyReady() ) {
            initModule();
        } else {
            each( dependencies, function ( dependId ) {
                mod_addDefinedListener( dependId, tryInitModule );
            } );
        }

        /**
         * 尝试初始化模块。若依赖全部加载则执行初始化
         * 
         * @inner
         */
        function tryInitModule() {
            if ( isDependencyReady() ) {
                initModule();
            }
        }

        /**
         * 判断依赖加载完成
         * 
         * @inner
         * @return {boolean}
         */
        function isDependencyReady() {
            var isReady = 1;
            each( dependencies, function ( dependId ) {
                if ( !mod_exists( dependId ) ) {
                    isReady = 0;
                    return false;
                }
            } );

            return isReady;
        }

        /**
         * 初始化模块
         * 
         * @inner
         */
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

    /**
     * 触发模块defined事件
     * 
     * @inner
     * @param {string} id 模块标识
     */
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
     * 判断模块是否已定义
     * 
     * @inner
     * @param {string} id 模块标识
     * @return {boolean}
     */
    function mod_exists( id ) {
        return id in mod_definedModule;
    }

    /**
     * 判断模块是否正在定义
     * 
     * @inner
     * @param {string} id 模块标识
     * @return {boolean}
     */
    function mod_isDefining( id ) {
        return id in mod_definingModule;
    }

    /**
     * 获取模块
     * 
     * @inner
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
     * @inner
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
     * @inner
     * @param {string} id 模块标识
     * @return {Object}
     */
    function mod_getDefining( id ) {
        return mod_definingModule[ id ];
    }

    /**
     * 添加资源
     * 
     * @inner
     * @param {string} resourceId 资源标识
     * @param {*} value 资源对象
     */
    function mod_addResource( resourceId, value ) {
        mod_definedModule[ resourceId ] = {
            exports: value || true
        };

        mod_fireDefined( resourceId );
    }

    /**
     * 当前script中的define集合
     * 
     * @inner
     * @type {Array}
     */
    var currentScriptDefines = [];

    /**
     * 内建module名称集合
     * 
     * @inner
     * @type {Object}
     */
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

        for ( var i = 0, len = arguments.length; i < len; i++ ) {
            var arg = arguments[ i ];

            switch ( typeof arg ) {
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
        
        // IE下通过current script的data-require-id获取当前id
        if ( !id && getDocument().attachEvent && (!isOpera()) ) {
            id = getCurrentScript().getAttribute( 'data-require-id' );
        }

        // 纪录到共享变量中，在load或readystatechange中处理
        currentScriptDefines.push( {
            id      : id,
            deps    : dependencies || [],
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
        var pluginModules = [];
        var defines = currentScriptDefines.slice( 0 );

        currentScriptDefines.length = 0;
        currentScriptDefines = [];

        // 第一遍处理合并依赖，找出依赖中是否包含资源依赖
        each(
            defines,
            function ( defineItem, defineIndex ) {
                var id = defineItem.id || currentId;
                var depends = defineItem.deps;
                var factory = defineItem.factory;
                var normalize = createNormalizer( id );
                
                if ( mod_isDefining( id ) || mod_exists( id ) ) {
                    return;
                }

                // 处理define中编写的依赖声明
                // 默认为['require', 'exports', 'module']
                if ( depends.length === 0 ) {
                    depends.push( 'require', 'exports', 'module' );
                }

                // 处理实际需要加载的依赖
                var realDepends = [];
                defineItem.realDeps = realDepends;
                realDepends.push.apply( realDepends, depends );

                // 分析function body中的require
                if ( typeof factory == 'function' ) {
                    var match;
                    var factoryBody = factory.toString();
                    var requireRule = /require\(\s*(['"'])([^'"]+)\1\s*\)/g;
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
        
        // 尝试加载"资源加载所需模块"，后进行第二次处理
        // 需要先加载模块的愿意是：如果模块不存在，无法进行资源id normalize化
        // pretreatAndDefine处理所有依赖，并进行module define
        require( pluginModules, pretreatAndDefine );

        /**
         * 判断模块是否在后续的定义中
         * 
         * 对于一个文件多个define的合并文件，如果其依赖的模块在后续有define
         * 当前模块应该不等待对后续依赖模块的define，自己先define
         * 原因：
         * 开发时或构建工具在文件合并时，会打断后分析模块对前分析模块的循环依赖
         * 构建结果文件中后分析模块的define代码会置于文件前部
         * 
         * @inner
         * @param {number} startIndex 开始索引
         * @param {string} dependId 模块id
         * @return {boolean} 
         */
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

        /**
         * 预处理依赖，并进行define
         * 
         * @inner
         */
        function pretreatAndDefine() {
            each(
                defines,
                function ( defineItem, defineIndex ) {
                    var id = defineItem.id || currentId;
                    var depends = defineItem.deps;
                    var realDepends = defineItem.realDeps;
                    var normalize = createNormalizer( id );

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

        /**
         * 判断source是否处于target的依赖链中
         * 
         * @inner
         * @return {boolean}
         */
        function isInDependencyChain( source, target ) {
            var module = mod_getDefining( target ) || mod_get( target );
            var depends = module && module.dependencies;

            if ( depends ) {
                var len = depends.length;

                while ( len-- ) {
                    var dependName = depends[ len ];
                    if ( source == dependName
                         || isInDependencyChain( source, dependName ) ) {
                        return 1;
                    }
                }
            }

            return 0;
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
        // 根据 https://github.com/amdjs/amdjs-api/wiki/require
        // It MUST throw an error if the module has not 
        // already been loaded and evaluated.
        if ( typeof moduleId == 'string' ) {
            if ( !mod_exists( moduleId ) ) {
                throw { message: moduleId + ' is not exists!' };
            }

            return mod_get( moduleId );
        }

        if ( !( moduleId instanceof Array ) ) {
            return;
        }

        callback = callback || new Function();
        if ( moduleId.length === 0 ) {
            callback();
            return;
        }
        
        var baseId = arguments[ 2 ] || '';
        each(
            moduleId,
            function ( id ) {
                mod_addDefinedListener( id, tryFinishRequire );
                if ( id.indexOf( '!' ) > 0 ) {
                    loadResource( id, baseId );
                }
                else {
                    loadModule( id );
                }
            }
        );

        tryFinishRequire();

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
    }

    /**
     * require配置
     * 
     * @inner
     * @type {Object}
     */
    var requireConf = { 
        baseUrl : './',
        paths   : {},
        config  : {},
        map     : {}
    };

    /**
     * 配置require
     * 
     * @param {Object} conf 配置对象
     */
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

    /**
     * 将[module ID] + '.extension'格式的字符串转换成url
     * 
     * @param {string} source 符合描述格式的源字符串
     * @return {string} 
     */
    require.toUrl = function ( source ) {
        return toUrl( source, '' );
    };

    /**
     * 将[module ID] + '.extension'格式的字符串转换成url
     * 
     * @param {string} source 符合描述格式的源字符串
     * @param {string} baseId 当前环境的模块标识
     * @return {string}
     */
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
    }

    /**
     * 创建local require函数
     * 
     * @param {number} baseId 当前module id
     * @return {Function}
     */
    function createLocalRequire( baseId ) {
        var normalize = createNormalizer( baseId );
        function req( requireId, callback ) {
            return require( normalize( requireId ), callback, baseId );
        }

        req.toUrl = function ( name ) {
            return toUrl( name, baseId );
        };

        return req;
    }

    // 暴露全局对象
    define.amd = { multiversion: true };
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
             || mod_isDefining( moduleId )
             || loadingModules[ moduleId ]
        ) {
            return;
        }

        loadingModules[ moduleId ] = 1;

        // 创建script标签
        var script = getDocument().createElement( 'script' );
        script.setAttribute( 'data-require-id', moduleId );
        script.src = id2Path( moduleId );
        script.async = true;
        if ( script.readyState ) {
            script.onreadystatechange = loadedListener;
        }
        else {
            script.onload = loadedListener;
        }
        // TODO: onerror
        appendScript( script );

        /**
         * script标签加载完成的事件处理函数
         * 
         * @inner
         */
        function loadedListener() {
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
    }

    /**
     * 加载资源
     * 
     * @inner
     * @param {string} pluginAndResource 插件与资源标识
     * @param {string} baseId 当前环境的模块标识
     */
    function loadResource( pluginAndResource, baseId ) {
        var idInfo = parseId( pluginAndResource );
        var pluginId = idInfo.module;
        var resourceId = idInfo.resource;
        var plugin = mod_get( pluginId );

        function load( plugin ) {
            plugin.load( 
                resourceId, 
                createLocalRequire( baseId ),
                function ( value ) {
                    mod_addResource( pluginAndResource, value );
                }
            );
        }

        if ( !plugin ) {
            require( [ pluginId ], load ); 
        }
        else {
            load( plugin );
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

    /**
     * 创建id normalize函数
     * 
     * @param {string} baseId 当前环境的模块标识
     * @return {function(string)}
     */
    function createNormalizer( baseId ) {
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
            if ( !id ) {
                return '';
            }

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

    /**
     * id正则规则表示
     * 
     * @const
     * @inner
     * @type {RegExp}
     */
    var REG_ID = /^([-_a-z0-9\.]+(\/[-_a-z0-9\.]+)*)(!.*)?$/i;

    /**
     * 解析id，返回带有module和resource属性的Object
     * 
     * @inner
     * @param {string} id 标识
     * @return {Object}
     */
    function parseId( id ) {
        var match = REG_ID.exec( id );
        if ( match && match.length > 0 ) {
            var resourceId = match[ 3 ] ? match[ 3 ].slice( 1 ) : '';
            return {
                module   : match[ 1 ],
                resource : resourceId
            };
        }

        return null;
    }

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
