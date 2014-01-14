/**
 * ESL (Enterprise Standard Loader)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file Browser端标准加载器，符合AMD规范
 * @author errorrik(errorrik@gmail.com)
 *         Firede(firede@firede.us)
 */

var define;
var require;

(function ( global ) {
    // "mod"开头的变量或函数为内部模块管理函数
    // 为提高压缩率，不使用function或object包装
    
    /**
     * 模块容器
     * 
     * @inner
     * @type {Object}
     */
    var modModules = {};

    /**
     * 模块容器副本，不包含resource
     * 在modAnalyse时，从list里遍历比forin更高效
     * 
     * @inner
     * @type {Array}
     */
    var modModuleList = [];

    // 模块状态枚举量
    var MODULE_PRE_DEFINED = 1;
    var MODULE_ANALYZED = 2;
    var MODULE_DEFINED = 3;
    var MODULE_COMPLETED = 4;

    /**
     * 全局require函数
     * 
     * @inner
     * @type {Function}
     */
    var actualGlobalRequire = createLocalRequire();

    // #begin-ignore
    /**
     * 超时提醒定时器
     * 
     * @inner
     * @type {number}
     */
    var waitTimeout;
    // #end-ignore
    
    /**
     * 加载模块
     * 
     * @param {string|Array} requireId 模块id或模块id数组，
     * @param {Function=} callback 加载完成的回调函数
     * @return {*}
     */
    function require( requireId, callback ) {
        // #begin-ignore
        assertNotContainRelativeId( requireId );
        
        // 超时提醒
        var timeout = requireConf.waitSeconds;
        if ( isArray( requireId ) && timeout ) {
            if ( waitTimeout ) {
                clearTimeout( waitTimeout );
            }
            waitTimeout = setTimeout( waitTimeoutNotice, timeout * 1000 );
        }
        // #end-ignore

        return actualGlobalRequire( requireId, callback );
    }

    /**
     * 将模块标识转换成相对的url
     * 
     * @param {string} id 模块标识
     * @return {string}
     */
    require.toUrl = actualGlobalRequire.toUrl;

    // #begin-ignore
    /**
     * 超时提醒函数
     * 
     * @inner
     */
    function waitTimeoutNotice() {
        var hangModules = [];
        var missModules = [];
        var missModulesMap = {};
        var hasError;

        for ( var id in modModules ) {
            if ( !modIsDefined( id ) ) {
                hasError = 1;
                hangModules.push( id );
            }

            each(
                modModules[ id ].depMs || [],
                function ( dep ) {
                    var depId = dep.absId;
                    if ( !modModules[ depId ] && !missModulesMap[ depId ] ) {
                        hasError = 1;
                        missModules.push( depId );
                        missModulesMap[ depId ] = 1;
                    }
                }
            );
        }

        if ( hasError ) {
            throw new Error( '[MODULE_TIMEOUT]Hang( ' 
                + ( hangModules.join( ', ' ) || 'none' )
                + ' ) Miss( '
                + ( missModules.join( ', ' ) || 'none' )
                + ' )'
            );
        }
    }
    // #end-ignore
    
    /**
     * 尝试完成模块定义的定时器
     * 
     * @inner
     * @type {number}
     */
    var tryDefineTimeout;

    /**
     * 定义模块
     * 
     * @param {string=} id 模块标识
     * @param {Array=} dependencies 依赖模块列表
     * @param {Function=} factory 创建模块的工厂方法
     */
    function define() {
        var argsLen = arguments.length;
        if ( !argsLen ) {
            return;
        }

        var id;
        var dependencies;
        var factory = arguments[ --argsLen ];

        while ( argsLen-- ) {
            var arg = arguments[ argsLen ];

            if ( typeof arg === 'string' ) {
                id = arg;
            }
            else if ( isArray( arg ) ) {
                dependencies = arg;
            }
        }
        
        // 出现window不是疏忽
        // esl设计是做为browser端的loader
        // 闭包的global更多意义在于：
        //     define和require方法可以被挂到用户自定义对象中
        var opera = window.opera;

        // IE下通过current script的data-require-id获取当前id
        if ( 
            !id 
            && document.attachEvent 
            && (!(opera && opera.toString() === '[object Opera]')) 
        ) {
            var currentScript = getCurrentScript();
            id = currentScript && currentScript.getAttribute('data-require-id');
        }

        if ( id ) {
            modPreDefine( id, dependencies, factory );

            // 在不远的未来尝试完成define
            // define可能是在页面中某个地方调用，不一定是在独立的文件被require装载
            if ( tryDefineTimeout ) {
                clearTimeout( tryDefineTimeout );
            }
            tryDefineTimeout = setTimeout( modAnalyse, 1 );
        }
        else {
            // 纪录到共享变量中，在load或readystatechange中处理
            // 标准浏览器下，使用匿名define时，将进入这个分支
            wait4PreDefines.push( {
                deps    : dependencies,
                factory : factory
            } );
        }
    }

    define.amd = {};

    /**
     * 模块配置获取函数
     * 
     * @inner
     * @return {Object} 模块配置对象
     */
    function moduleConfigGetter() {
        var conf = requireConf.config[ this.id ];
        if ( conf && typeof conf === 'object' ) {
            return conf;
        }

        return {};
    }

    /**
     * 预定义模块
     * 
     * @inner
     * @param {string} id 模块标识
     * @param {Array.<string>} dependencies 显式声明的依赖模块列表
     * @param {*} factory 模块定义函数或模块对象
     */
    function modPreDefine( id, dependencies, factory ) {
        if ( modModules[ id ] ) {
            return;
        }

        // 模块内部信息包括
        // -----------------------------------
        // id: module id
        // deps: 模块定义时声明的依赖，默认为['require', 'exports', 'module']
        // factory: 初始化函数或对象
        // factoryDeps: 初始化函数的参数依赖
        // exports: 模块的实际暴露对象（AMD定义）
        // config: 用于获取模块配置信息的函数（AMD定义）
        // state: 模块当前状态
        // require: local require函数
        // depMs: 实际依赖的模块集合，数组形式
        // depMsIndex: 实际依赖的模块集合，表形式，便于查找
        // depRs: 实际依赖的资源集合
        // depPMs: 用于加载资源的模块集合，key是模块名，value是1，仅用于快捷查找
        // ------------------------------------
        var module = {
            id          : id,
            deps        : dependencies || ['require', 'exports', 'module'],
            factoryDeps : [],
            factory     : factory,
            exports     : {},
            config      : moduleConfigGetter,
            state       : MODULE_PRE_DEFINED,
            require     : createLocalRequire( id ),
            depMs       : [],
            depMsIndex  : {},
            depRs       : [],
            depPMs      : {}
        };

        // 将模块存入容器
        modModules[ id ] = module;
        modModuleList.push( module );
    }

    var REQUIRE_RULE = /require\(\s*(['"'])([^'"]+)\1\s*\)/g;
    var COMMENT_RULE = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

    /**
     * 预分析模块
     * 
     * 首先，完成对factory中声明依赖的分析提取
     * 然后，尝试加载"资源加载所需模块"
     * 
     * 需要先加载模块的原因是：如果模块不存在，无法进行resourceId normalize化
     * modAnalyse完成后续的依赖分析处理，并进行依赖模块的加载
     * 
     * @inner
     * @param {Object} modules 模块对象
     */
    function modAnalyse() {
        var requireModules = [];
        var requireModulesIndex = {};

        /**
         * 添加需要请求的模块
         * 
         * @inner
         * @param {string} id 模块id
         */
        function addRequireModule( id ) {
            if ( modModules[ id ] || requireModulesIndex[ id ] ) {
                return;
            }

            requireModules.push( id );
            requireModulesIndex[ id ] = 1;
        }

        each( modModuleList, function ( module ) {
            if ( module.state > MODULE_PRE_DEFINED ) {
                return;
            }

            // 处理define中显式声明的dependencies
            var deps = module.deps.slice( 0 );
            var declareDepsCount = deps.length;
            var hardDependsCount = 0;

            // 分析function body中的require
            // 如果包含显式依赖声明，为性能考虑，可以不分析factoryBody
            // AMD的说明是`SHOULD NOT`，不过这里还是分析了
            var factory = module.factory;
            if ( typeof factory === 'function' ) {
                hardDependsCount = Math.min( factory.length, declareDepsCount );
                factory.toString()
                    .replace( COMMENT_RULE, '' )
                    .replace( REQUIRE_RULE, function ( $0, $1, depId ) {
                        deps.push( depId );
                    });
            }

            each( deps, function ( depId, index ) {
                var idInfo = parseId( depId );
                var absId = normalize( idInfo.module, module.id );
                var moduleInfo, resInfo;

                if ( absId && !BUILDIN_MODULE[ absId ] ) {
                    // 如果依赖是一个资源，将其信息添加到module.depRs
                    // 
                    // module.depRs中的项有可能是重复的。
                    // 在这个阶段，加载resource的module可能还未defined，导致此时resource id无法被normalize。
                    // 比如对a/b/c而言，下面几个resource可能指的是同一个资源：
                    // - js!../name.js
                    // - js!a/name.js
                    // - ../../js!../name.js
                    // 
                    // 所以加载资源的module ready时，需要遍历module.depRs进行处理
                    if ( idInfo.resource ) {
                        resInfo = {
                            id       : depId,
                            module   : absId,
                            resource : idInfo.resource
                        };
                        module.depPMs[ absId ] = 1;
                        module.depRs.push( resInfo );
                    }

                    // 对依赖模块的id normalize能保证正确性，在此处进行去重
                    moduleInfo = module.depMsIndex[ absId ];
                    if ( !moduleInfo ) {
                        moduleInfo = {
                            id       : idInfo.module,
                            absId    : absId,
                            hard     : index < hardDependsCount,
                            circular : CIRCULAR_DEP_UNREADY
                        };
                        module.depMs.push( moduleInfo );
                        module.depMsIndex[ absId ] = moduleInfo;
                        addRequireModule( absId );
                    }
                }
                else {
                    moduleInfo = { absId: absId };
                }

                // 如果当前正在分析的依赖项是define中声明的，
                // 则记录到module.factoryDeps中
                // 在factory invoke前将用于生成invoke arguments
                if ( index < declareDepsCount ) {
                    module.factoryDeps.push( resInfo || moduleInfo );
                }
            } );

            module.state = MODULE_ANALYZED;
            each(
                module.depMs, 
                function ( moduleInfo ) {
                    modMonitorDependencyDefined( module.id, moduleInfo.absId );
                }
            );
            modTryDefine( module );
        });

        nativeRequire( requireModules );
    }

    /**
     * 监视模块的依赖定义完成，并尝试初始化
     * 
     * @inner
     * @param {string} moduleId 模块id
     * @param {string} depId 依赖模块id
     */
    function modMonitorDependencyDefined( moduleId, depId ) {
        function tryDefine() {
            modTryInvokeFactory( moduleId );
        }

        modAddDefinedListener( 
            depId, 
            function () {
                var module = modModules[ moduleId ];

                // 对依赖的resource先进行normalize，然后尝试加载
                if ( module.depPMs[ depId ] ) {
                    each( 
                        module.depRs, 
                        function ( res ) {
                            if ( res.absId || res.module !== depId ) {
                                return;
                            }

                            res.absId = normalize( res.id, moduleId );
                            modAddDefinedListener( res.absId, tryDefine );
                            nativeRequire( [ res.absId ], null, moduleId );
                        }
                    );
                }

                tryDefine();
            }
        );
    }

    // 依赖准备状态，分成以下几种
    // -------------------
    // 未准备好：
    // 依赖模块链未加载完成。此时继续等待
    // 
    // 已经分析完成：
    // 此时所有依赖模块链都已加载完成，但依赖模块未完成定义。可以尝试对循环依赖的模块进行定义
    // 
    // 已准备好：
    // 1. 强依赖已经完成定义
    // 2. 非循环依赖已经完成定义
    // --------------------
    var DEP_UNREADY = 0;
    var DEP_ANALYZED = 1;
    var DEP_READY = 2;

    /**
     * 等待模块依赖加载完成
     * 加载完成后尝试调用factory完成模块定义
     * 
     * @inner
     * @param {Object} module 模块对象
     */
    function modTryDefine( module ) {
        var id = module.id;

        module.invokeFactory = invokeFactory;
        invokeFactory();

        /**
         * 检查依赖加载完成的状态
         * 
         * @inner
         * @return {number}
         */
        function checkInvokeReadyState() {
            var readyState = DEP_READY;

            // 先判断resource是否加载完成。如果resource未加载完成，则认为未准备好
            each(
                module.depRs,
                function ( dep ) {
                    if ( !( dep.absId && modIsDefined( dep.absId ) ) ) {
                        readyState = DEP_UNREADY;
                        return false;
                    }
                }
            );

            if ( readyState !== DEP_READY ) {
                return readyState;
            }

            // 检查所有依赖模块，根据以下因素处理readyState
            // 1. 是否定义完成
            // 2. 是否强依赖
            // 3. 是否循环依赖
            each(
                module.depMs,
                function ( dep ) {
                    if ( modIsDefined( dep.absId ) ) {
                        return;
                    }

                    // dep.circular相当于一层cache，尽量减少modHasCircularDependency多次调用的开销
                    if ( dep.circular === CIRCULAR_DEP_UNREADY ) {
                        dep.circular = modHasCircularDependency( id, dep.absId );
                    }

                    switch ( dep.circular ) {
                        case CIRCULAR_DEP_YES:
                            if ( dep.hard ) {
                                readyState = DEP_ANALYZED;
                            }
                            break;
                        case CIRCULAR_DEP_NO:
                            readyState = DEP_ANALYZED;
                            break;
                        case CIRCULAR_DEP_UNREADY:
                            readyState = DEP_UNREADY;
                            return false;
                    }
                }
            );

            return readyState;
        }

        /**
         * 初始化模块
         * 
         * @inner
         */
        function invokeFactory() {
            if ( module.state >= MODULE_DEFINED ) {
                return;
            }

            // 先尝试完成循环依赖模块的定义
            var invokeReadyState = checkInvokeReadyState();
            if ( invokeReadyState >= DEP_ANALYZED ) {
                tryCircularDependencies();
            }

            if ( invokeReadyState < DEP_READY ) {
                return;
            }

            // 拼接factory invoke所需的arguments
            var factoryDeps = [];
            each( module.factoryDeps, function ( dep ) {
                factoryDeps.push( dep.absId );
            } );
            var args = modGetModulesExports( 
                factoryDeps, 
                {
                    require : module.require,
                    exports : module.exports,
                    module  : module
                }
            );
            
            // 调用factory函数初始化module
            try {
                var factory = module.factory;
                var exports = typeof factory === 'function'
                    ? factory.apply( global, args )
                    : factory;

                if ( exports != null ) {
                    module.exports = exports;
                }
            } 
            catch ( ex ) {
                if ( /^\[MODULE_MISS\]"([^"]+)/.test( ex.message ) ) {
                    // 出错，则说明在factory的运行中，该require的模块是需要的
                    // 所以把它加入强依赖中
                    var hardCirclurDep = module.depMsIndex[ RegExp.$1 ];
                    hardCirclurDep && (hardCirclurDep.hard = 1);
                    return;
                }

                throw ex;
            }

            // 只把factory call代码放在try里
            // 避免后续操作因为try而吞掉错误
            module.state = MODULE_DEFINED;
            module.invokeFactory = null;
            modFireDefined( id );
        }

        var circularDependenciesTried;

        /**
         * 尝试完成循环依赖模块的定义
         * 
         * 尝试的前提条件是依赖模块链已经加载完成
         * 在该条件下如果循环依赖是活的，尝试一圈一定有解（依赖模块会调用同样的方法，递归尝试）
         * 所以只尝试一次，并且对标志变量的设置必须在执行之前，否则碰到死循环依赖将卡死
         * 
         * @inner
         */
        function tryCircularDependencies() {
            if ( !circularDependenciesTried ) {
                circularDependenciesTried = 1;
                each( 
                    module.depMs, 
                    function ( dep ) {
                        if ( dep.circular === CIRCULAR_DEP_YES ) {
                            modTryInvokeFactory( dep.absId );
                        }
                    }
                );
            }
        }
    }

    /**
     * 判断模块是否已分析完成
     * 
     * @inner
     * @param {string} id 模块标识
     * @return {boolean}
     */
    function modIsAnalyzed( id ) {
        return modModules[ id ] && modModules[ id ].state >= MODULE_ANALYZED;
    }

    /**
     * 判断模块是否已定义
     * 
     * @inner
     * @param {string} id 模块标识
     * @return {boolean}
     */
    function modIsDefined( id ) {
        return modModules[ id ] && modModules[ id ].state >= MODULE_DEFINED;
    }

    /**
     * 判断模块是否定义完成，即模块与其依赖全部已定义
     * 
     * @inner
     * @param {string} id 模块标识
     * @return {boolean}
     */
    function modIsCompleted( id, visited ) {
        var module = modModules[ id ];
        visited = visited || {};
        visited[ id ] = 1;

        if ( !module || module.state < MODULE_DEFINED ) {
            return false;
        }

        if ( module.state === MODULE_COMPLETED ) {
            return true;
        }

        var deps = module.depMs;
        var len = deps.length;

        while ( len-- ) {
            var depId = deps[ len ].absId;
            if ( visited[ depId ] ) {
                continue;
            }

            if( !modIsCompleted( depId, visited ) ) {
                return false;
            }
        }

        module.state = MODULE_COMPLETED;
        return true;
    }

    /**
     * 根据模块id数组，获取其的exports数组
     * 用于模块初始化的factory参数或require的callback参数生成
     * 
     * @inner
     * @param {Array} modules 模块id数组
     * @param {Object} buildinModules 内建模块对象
     * @return {Array}
     */
    function modGetModulesExports( modules, buildinModules ) {
        var args = [];
        each( 
            modules,
            function ( moduleId ) {
                args.push(
                    buildinModules[ moduleId ]
                    || modGetModuleExports( moduleId )
                );
            } 
        );

        return args;
    }

    // 循环依赖状态
    // UNREADY: 依赖链还未完成加载，无法判断是否循环依赖
    // NO: 无循环依赖
    // YES: 有循环依赖
    var CIRCULAR_DEP_UNREADY = 0;
    var CIRCULAR_DEP_NO = 1;
    var CIRCULAR_DEP_YES = 2;

    /**
     * 判断source是否处于target的依赖链中
     *
     * @inner
     * @return {number}
     */
    function modHasCircularDependency( source, target, visited ) {
        if ( !modIsAnalyzed( target ) ) {
            return CIRCULAR_DEP_UNREADY;
        }

        visited = visited || {};
        visited[ target ] = 1;
        
        var module = modModules[ target ];

        if ( target === source ) {
            return CIRCULAR_DEP_YES;
        }
        
        var deps = module && module.depMs;
        if ( deps ) {
            var len = deps.length;

            while ( len-- ) {
                var depId = deps[ len ].absId;
                if ( visited[ depId ] ) { 
                    continue;
                }

                var state = modHasCircularDependency( source, depId, visited );
                switch ( state ) {
                    case CIRCULAR_DEP_YES:
                    case CIRCULAR_DEP_UNREADY:
                        return state;
                }
            }
        }

        return CIRCULAR_DEP_NO;
    }

    /**
     * 尝试执行模块factory函数，进行模块初始化
     * 
     * @inner
     * @param {string} id 模块id
     */
    function modTryInvokeFactory( id ) {
        var module = modModules[ id ];

        if ( module && module.invokeFactory ) {
            module.invokeFactory();
        }
    }

    /**
     * 模块定义完成的事件监听器
     * 
     * @inner
     * @type {Object}
     */
    var modDefinedListener = {};

    /**
     * 派发模块定义完成事件
     * 
     * @inner
     * @param {string} id 模块标识
     */
    function modFireDefined( id ) {
        var listeners = modDefinedListener[ id ] || [];
        var len = listeners.length;
        while ( len-- ) {
            var listener = listeners[ len ];
            listener && listener();
        }

        // 清理listeners
        listeners.length = 0;
        delete modDefinedListener[ id ];
    }

    /**
     * 添加模块定义监听器
     * 
     * @inner
     * @param {string} id 模块标识
     * @param {Function} listener 模块定义监听器
     * @param {boolean} lowPriority 是否低优先级触发
     */
    function modAddDefinedListener( id, listener, lowPriority ) {
        if ( modIsDefined( id ) ) {
            listener( id );
            return;
        }

        var listeners = modDefinedListener[ id ];
        if ( !listeners ) {
            listeners = modDefinedListener[ id ] = [];
        }

        lowPriority 
            ? listeners.unshift( listener )
            : listeners.push( listener );
    }

    /**
     * 获取模块的exports
     * 
     * @inner
     * @param {string} id 模块标识
     * @return {*}
     */
    function modGetModuleExports( id ) {
        if ( modIsDefined( id ) ) {
            return modModules[ id ].exports;
        }

        return null;
    }

    /**
     * 内建module名称集合
     * 
     * @inner
     * @type {Object}
     */
    var BUILDIN_MODULE = {
        require : require,
        exports : 1,
        module  : 1
    };

    /**
     * 未预定义的模块集合
     * 主要存储匿名方式define的模块
     * 
     * @inner
     * @type {Array}
     */
    var wait4PreDefines = [];

    /**
     * 完成模块预定义
     * 
     * @inner
     */
    function completePreDefine( currentId ) {
        var preDefines = wait4PreDefines.slice( 0 );

        wait4PreDefines.length = 0;
        wait4PreDefines = [];

        // 预定义模块：
        // 此时处理的模块都是匿名define的模块
        each(
            preDefines,
            function ( module ) {
                modPreDefine( 
                    module.id || currentId, 
                    module.deps, 
                    module.factory
                );
            }
        );

        modAnalyse();
    }
    
    /**
     * 获取模块
     * 
     * @param {string|Array} ids 模块名称或模块名称列表
     * @param {Function=} callback 获取模块完成时的回调函数
     * @return {Object}
     */
    function nativeRequire( ids, callback, baseId ) {
        // 根据 https://github.com/amdjs/amdjs-api/wiki/require
        // It MUST throw an error if the module has not 
        // already been loaded and evaluated.
        if ( typeof ids === 'string' ) {
            if ( !modIsDefined( ids ) ) {
                throw new Error( '[MODULE_MISS]"' + ids + '" is not exists!' );
            }

            return modGetModuleExports( ids );
        }

        var isCallbackCalled = 0;
        if ( isArray( ids ) ) {
            tryFinishRequire();
            
            !isCallbackCalled && each(
                ids,
                function ( id ) {
                    if ( !BUILDIN_MODULE[ id ] ) {
                        // 以低优先级触发模式挂载监听器
                        // 循环依赖中能先完成依赖其模块的定义
                        modAddDefinedListener( id, tryFinishRequire, 1 );
                        ( id.indexOf( '!' ) > 0 
                            ? loadResource
                            : loadModule
                        )( id, baseId );
                    }
                }
            );
        }

        /**
         * 尝试完成require，调用callback
         * 在模块与其依赖模块都加载完时调用
         * 
         * @inner
         */
        function tryFinishRequire() {
            if ( !isCallbackCalled ) {
                var isAllCompleted = 1;
                each( ids, function ( id ) {
                    if ( !BUILDIN_MODULE[ id ] ) {
                        return ( isAllCompleted = modIsCompleted( id ) );
                    }
                });

                // 检测并调用callback
                if ( isAllCompleted ) {
                    isCallbackCalled = 1;

                    (typeof callback === 'function') && callback.apply( 
                        global, 
                        modGetModulesExports( ids, BUILDIN_MODULE )
                    );
                }
            }
        }
    }

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
        if ( loadingModules[ moduleId ] || modModules[ moduleId ] ) {
            return;
        }
        
        loadingModules[ moduleId ] = 1;

        // 创建script标签
        // 
        // 这里不挂接onerror的错误处理
        // 因为高级浏览器在devtool的console面板会报错
        // 再throw一个Error多此一举了
        var script = document.createElement( 'script' );
        script.setAttribute( 'data-require-id', moduleId );
        script.src = toUrl( moduleId + '.js' ) ;
        script.async = true;
        if ( script.readyState ) {
            script.onreadystatechange = loadedListener;
        }
        else {
            script.onload = loadedListener;
        }
        appendScript( script );

        /**
         * script标签加载完成的事件处理函数
         * 
         * @inner
         */
        function loadedListener() {
            var readyState = script.readyState;
            if ( 
                typeof readyState === 'undefined'
                || /^(loaded|complete)$/.test( readyState )
            ) {
                script.onload = script.onreadystatechange = null;
                script = null;

                completePreDefine( moduleId );
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
        if ( modModules[ pluginAndResource ] ) {
            return;
        }

        var idInfo = parseId( pluginAndResource );
        var resource = {
            id: pluginAndResource,
            state: MODULE_ANALYZED
        };
        modModules[ pluginAndResource ] = resource;

        /**
         * plugin加载完成的回调函数
         * 
         * @inner
         * @param {*} value resource的值
         */
        function pluginOnload( value ) {
            resource.state = MODULE_COMPLETED;
            resource.exports = value || true;
            modFireDefined( pluginAndResource );
        }

        /**
         * 该方法允许plugin使用加载的资源声明模块
         * 
         * @param {string} name 模块id
         * @param {string} body 模块声明字符串
         */
        pluginOnload.fromText = function ( id, text ) {
            new Function( text )();
            completePreDefine( id );
        };

        /**
         * 加载资源
         * 
         * @inner
         * @param {Object} plugin 用于加载资源的插件模块
         */
        function load( plugin ) {
            var pluginRequire = baseId
                ? modModules[ baseId ].require
                : actualGlobalRequire;

            plugin.load( 
                idInfo.resource, 
                pluginRequire,
                pluginOnload,
                moduleConfigGetter.call( { id: pluginAndResource } )
            );
        }

        nativeRequire( [ idInfo.module ], load );
    }

    /**
     * require配置
     * 
     * @inner
     * @type {Object}
     */
    var requireConf = { 
        baseUrl     : './',
        paths       : {},
        config      : {},
        map         : {},
        packages    : [],
        // #begin-ignore
        waitSeconds : 0,
        // #end-ignore
        urlArgs     : {}
    };

    /**
     * 配置require
     * 
     * @param {Object} conf 配置对象
     */
    require.config = function ( conf ) {
        for ( var key in requireConf ) {
            if ( conf.hasOwnProperty( key ) ) {

                var newValue = conf[ key ];
                var oldValue = requireConf[ key ];

                if ( key === 'urlArgs' && typeof newValue === 'string' ) {
                    defaultUrlArgs = newValue;
                }
                else {
                    // 简单的多处配置还是需要支持，所以配置实现为支持二级mix
                    var type = typeof oldValue;
                    if ( type === 'string' || type === 'number' ) {
                        requireConf[ key ] = newValue;
                    }
                    else if ( isArray( oldValue ) ) {
                        each( newValue, function ( item ) {
                            oldValue.push( item );
                        } );
                    }
                    else {
                        for ( var key in newValue ) {
                            oldValue[ key ] = newValue[ key ];
                        }
                    }
                }

            }
        }
        
        createConfIndex();
    };

    // 初始化时需要创建配置索引
    createConfIndex();

    /**
     * paths内部索引
     * 
     * @inner
     * @type {Array}
     */
    var pathsIndex;

    /**
     * packages内部索引
     * 
     * @inner
     * @type {Array}
     */
    var packagesIndex;

    /**
     * mapping内部索引
     * 
     * @inner
     * @type {Array}
     */
    var mappingIdIndex;

    /**
     * 默认的urlArgs
     * 
     * @inner
     * @type {string}
     */
    var defaultUrlArgs;

    /**
     * urlArgs内部索引
     * 
     * @inner
     * @type {Array}
     */
    var urlArgsIndex;

    /**
     * 创建配置信息内部索引
     * 
     * @inner
     */
    function createConfIndex() {
        requireConf.baseUrl = requireConf.baseUrl.replace( /\/$/, '' ) + '/';
        var descSorter = createDescSorter();

        // createPathsIndex
        pathsIndex = kv2List( requireConf.paths );
        pathsIndex.sort( descSorter );

        // createMappingIdIndex
        mappingIdIndex = kv2List( requireConf.map );
        mappingIdIndex.sort( descSorter );
        each(
            mappingIdIndex,
            function ( item ) {
                var key = item.k;
                item.v = kv2List( item.v );
                item.v.sort( descSorter );
                item.reg = key === '*'
                    ? /^/
                    : createPrefixRegexp( key );
            }
        );

        // createPackagesIndex
        packagesIndex = [];
        each( 
            requireConf.packages,
            function ( packageConf ) {
                var pkg = packageConf;
                if ( typeof packageConf === 'string' ) {
                    pkg = {
                        name: packageConf.split('/')[ 0 ],
                        location: packageConf,
                        main: 'main'
                    };
                }
                
                pkg.location = pkg.location || pkg.name;
                pkg.main = (pkg.main || 'main').replace(/\.js$/i, '');
                packagesIndex.push( pkg );
            }
        );
        packagesIndex.sort( createDescSorter( 'name' ) );

        // createUrlArgsIndex
        urlArgsIndex = kv2List( requireConf.urlArgs );
        urlArgsIndex.sort( descSorter );
    }

    /**
     * 将`模块标识+'.extension'`形式的字符串转换成相对的url
     * 
     * @inner
     * @param {string} source 源字符串
     * @return {string}
     */
    function toUrl( source ) {
        // 分离 模块标识 和 .extension
        var extReg = /(\.[a-z0-9]+)$/i;
        var queryReg = /(\?[^#]*)$/;
        var extname = '';
        var id = source;
        var query = '';

        if ( queryReg.test( source ) ) {
            query = RegExp.$1;
            source = source.replace( queryReg, '' );
        }

        if ( extReg.test( source ) ) {
            extname = RegExp.$1;
            id = source.replace( extReg, '' );
        }
        
        var url = id;

        // paths处理和匹配
        var isPathMap;
        each( pathsIndex, function ( item ) {
            var key = item.k;
            if ( createPrefixRegexp( key ).test( id ) ) {
                url = url.replace( key, item.v );
                isPathMap = 1;
                return false;
            }
        } );

        // packages处理和匹配
        if ( !isPathMap ) {
            each( 
                packagesIndex,
                function ( packageConf ) {
                    var name = packageConf.name;
                    if ( createPrefixRegexp( name ).test( id ) ) {
                        url = url.replace( name, packageConf.location );
                        return false;
                    }
                }
            );
        }

        // 相对路径时，附加baseUrl
        if ( !/^([a-z]{2,10}:\/)?\//i.test( url ) ) {
            url = requireConf.baseUrl + url;
        }

        // 附加 .extension 和 query
        url += extname + query;


        var isUrlArgsAppended;

        /**
         * 为url附加urlArgs
         * 
         * @inner
         * @param {string} args urlArgs串
         */
        function appendUrlArgs( args ) {
            if ( !isUrlArgsAppended ) {
                url += ( url.indexOf( '?' ) > 0 ? '&' : '?' ) + args;
                isUrlArgsAppended = 1;
            }
        }
        
        // urlArgs处理和匹配
        each( urlArgsIndex, function ( item ) {
            if ( createPrefixRegexp( item.k ).test( id ) ) {
                appendUrlArgs( item.v );
                return false;
            }
        } );
        defaultUrlArgs && appendUrlArgs( defaultUrlArgs );

        return url;
    }

    /**
     * 创建local require函数
     * 
     * @inner
     * @param {number} baseId 当前module id
     * @return {Function}
     */
    function createLocalRequire( baseId ) {
        var requiredCache = {};
        function req( requireId, callback ) {
            if ( typeof requireId === 'string' ) {
                var requiredModule = requiredCache[ requireId ];
                if ( !requiredModule ) {
                    requiredModule = 
                    requiredCache[ requireId ] = 
                        nativeRequire( normalize( requireId, baseId ) );
                }
                
                return requiredModule;
            }
            else if ( isArray( requireId ) ) {
                // 分析是否有resource，取出pluginModule先
                var pluginModules = [];
                each( 
                    requireId, 
                    function ( id ) { 
                        var idInfo = parseId( id );
                        if ( idInfo.resource ) {
                            pluginModules.push( 
                                normalize( idInfo.module, baseId )
                            );
                        }
                    }
                );

                // 加载模块
                nativeRequire( 
                    pluginModules, 
                    function () {
                        var ids = [];
                        each( 
                            requireId, 
                            function ( id ) { 
                                ids.push( normalize( id, baseId ) ); 
                            }
                        );
                        nativeRequire( ids, callback, baseId );
                    }, 
                    baseId
                );
            }
        }

        /**
         * 将[module ID] + '.extension'格式的字符串转换成url
         * 
         * @inner
         * @param {string} source 符合描述格式的源字符串
         * @return {string} 
         */
        req.toUrl = function ( id ) {
            return toUrl( normalize( id, baseId ) );
        };

        return req;
    }

    /**
     * id normalize化
     * 
     * @inner
     * @param {string} id 需要normalize的模块标识
     * @param {string} baseId 当前环境的模块标识
     * @return {string}
     */
    function normalize( id, baseId ) {
        if ( !id ) {
            return '';
        }

        baseId = baseId || '';
        var idInfo = parseId( id );
        if ( !idInfo ) {
            return id;
        }

        var resourceId = idInfo.resource;
        var moduleId = relative2absolute( idInfo.module, baseId );

        each(
            packagesIndex,
            function ( packageConf ) {
                var name = packageConf.name;
                if ( name === moduleId ) {
                    moduleId = name + '/' + packageConf.main;
                    return false;
                }
            }
        );

        // 根据config中的map配置进行module id mapping
        each( 
            mappingIdIndex, 
            function ( item ) {
                if ( item.reg.test( baseId ) ) {

                    each( item.v, function ( mapData ) {
                        var key = mapData.k;
                        var rule = createPrefixRegexp( key );
                        
                        if ( rule.test( moduleId ) ) {
                            moduleId = moduleId.replace( key, mapData.v );
                            return false;
                        }
                    } );

                    return false;
                }
            }
        );
        
        if ( resourceId ) {
            var module = modGetModuleExports( moduleId );
            resourceId = module.normalize
                ? module.normalize( 
                    resourceId, 
                    function ( resId ) {
                        return normalize( resId, baseId );
                    }
                  )
                : normalize( resourceId, baseId );
            
            moduleId += '!' + resourceId;
        }
        
        return moduleId;
    }

    /**
     * 相对id转换成绝对id
     * 
     * @inner
     * @param {string} id 要转换的id
     * @param {string} baseId 当前所在环境id
     * @return {string}
     */
    function relative2absolute( id, baseId ) {
        if ( id.indexOf( '.' ) === 0 ) {
            var basePath = baseId.split( '/' );
            var namePath = id.split( '/' );
            var baseLen = basePath.length - 1;
            var nameLen = namePath.length;
            var cutBaseTerms = 0;
            var cutNameTerms = 0;

            pathLoop: for ( var i = 0; i < nameLen; i++ ) {
                var term = namePath[ i ];
                switch ( term ) {
                    case '..':
                        if ( cutBaseTerms < baseLen ) {
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

            return basePath.concat( namePath ).join( '/' );
        }

        return id;
    }

    // #begin-ignore
    /**
     * 确定require的模块id不包含相对id。用于global require，提前预防难以跟踪的错误出现
     * 
     * @inner
     * @param {string|Array} requireId require的模块id
     */
    function assertNotContainRelativeId( requireId ) {
        var invalidIds = [];

        /**
         * 监测模块id是否relative id
         * 
         * @inner
         * @param {string} id 模块id
         */
        function monitor( id ) {
            if ( id.indexOf( '.' ) === 0 ) {
                invalidIds.push( id );
            }
        }

        if ( typeof requireId === 'string' ) {
            monitor( requireId );
        }
        else {
            each( 
                requireId, 
                function ( id ) {
                    monitor( id );
                }
            );
        }

        // 包含相对id时，直接抛出错误
        if ( invalidIds.length > 0 ) {
            throw new Error(
                '[REQUIRE_FATAL]Relative ID is not allowed in global require: ' 
                + invalidIds.join( ', ' )
            );
        }
    }
    // #end-ignore

    /**
     * 模块id正则
     * 
     * @const
     * @inner
     * @type {RegExp}
     */
    var MODULE_ID_REG = /^[-_a-z0-9\.]+(\/[-_a-z0-9\.]+)*$/i;

    /**
     * 解析id，返回带有module和resource属性的Object
     * 
     * @inner
     * @param {string} id 标识
     * @return {Object}
     */
    function parseId( id ) {
        var segs = id.split( '!' );

        if ( MODULE_ID_REG.test( segs[ 0 ] ) ) {
            return {
                module   : segs[ 0 ],
                resource : segs[ 1 ]
            };
        }

        return null;
    }

    /**
     * 将对象数据转换成数组，数组每项是带有k和v的Object
     * 
     * @inner
     * @param {Object} source 对象数据
     * @return {Array.<Object>}
     */
    function kv2List( source ) {
        var list = [];
        for ( var key in source ) {
            if ( source.hasOwnProperty( key ) ) {
                list.push( {
                    k: key, 
                    v: source[ key ]
                } );
            }
        }

        return list;
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
            && interactiveScript.readyState === 'interactive'
        ) {
            return interactiveScript;
        }
        else {
            var scripts = document.getElementsByTagName( 'script' );
            var scriptLen = scripts.length;
            while ( scriptLen-- ) {
                var script = scripts[ scriptLen ];
                if ( script.readyState === 'interactive' ) {
                    interactiveScript = script;
                    return script;
                }
            }
        }
    }

    var headElement = document.getElementsByTagName( 'head' )[ 0 ];
    var baseElement = document.getElementsByTagName( 'base' )[ 0 ];
    if ( baseElement ) {
        headElement = baseElement.parentNode;
    }

    /**
     * 向页面中插入script标签
     * 
     * @inner
     * @param {HTMLScriptElement} script script标签
     */
    function appendScript( script ) {
        currentlyAddingScript = script;

        // If BASE tag is in play, using appendChild is a problem for IE6.
        // See: http://dev.jquery.com/ticket/2709
        baseElement
            ? headElement.insertBefore( script, baseElement )
            : headElement.appendChild( script );

        currentlyAddingScript = null;
    }

    /**
     * 创建id前缀匹配的正则对象
     * 
     * @inner
     * @param {string} prefix id前缀
     * @return {RegExp}
     */
    function createPrefixRegexp( prefix ) {
        return new RegExp( '^' + prefix + '(/|$)' );
    }

    /**
     * 判断对象是否数组类型
     * 
     * @inner
     * @param {*} obj 要判断的对象
     * @return {boolean}
     */
    function isArray( obj ) {
        return obj instanceof Array;
    }

    /**
     * 循环遍历数组集合
     * 
     * @inner
     * @param {Array} source 数组源
     * @param {function(Array,Number):boolean} iterator 遍历函数
     */
    function each( source, iterator ) {
        if ( isArray( source ) ) {
            for ( var i = 0, len = source.length; i < len; i++ ) {
                if ( iterator( source[ i ], i ) === false ) {
                    break;
                }
            }
        }
    }

    /**
     * 创建数组字符数逆序排序函数
     * 
     * @inner
     * @param {string} property 数组项对象名
     * @return {Function}
     */
    function createDescSorter( property ) {
        property = property || 'k';

        return function ( a, b ) {
            var aValue = a[ property ];
            var bValue = b[ property ];

            if ( bValue === '*' ) {
                return -1;
            }

            if ( aValue === '*' ) {
                return 1;
            }

            return bValue.length - aValue.length;
        };
    }

    // 暴露全局对象
    global.define = define;
    global.require = require;
})( this );
