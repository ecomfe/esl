/**
 * @file js loader run in browser
 *       module define conforming amd spec
 * @author errorrik(errorrik@gmail.com)
 */

// TODO: sweep code


var define;
var require;

(function ( global ) {
    var ie = /msie/i.test( global.navigator );
    var currentScriptDefines = [];

    /**
     * 模块管理
     * 
     * @inner
     * @type {Object}
     */
    var modules = (function () {
        /**
         * 已定义模块容器
         * 
         * @inner
         * @type {Object}
         */
        var definedModule = {};

        /**
         * 定义中模块容器
         * 
         * @inner
         * @type {Object}
         */
        var definingModule = {};

        /**
         * 模块添加事件监听器
         * 
         * @inner
         * @type {Object.<Array>}
         */
        var modulesDefineListener = {};
        
        /**
         * 模块管理
         * 
         * @inner
         */
        return {
            /**
             * 定义模块
             * 
             * @param {string} id 模块标识
             */
            define: function ( id ) {
                var module = definingModule[ id ];
                if ( !module ) {
                    return;
                }

                var deps = module.dependencies;
                var len  = deps.length;

                while ( len-- ) {
                    var dependName = deps[ len ];
                    if ( !this.exists( dependName ) ) {
                        return;
                    }
                }
console.log( 'define ' + id );
                var factoryDeps = module.factoryDependencies;
                var len  = factoryDeps.length;
                var args = [];

                while ( len-- ) {
                    var dependName = factoryDeps[ len ];
                    args[ len ] = module.buildinModule[ dependName ]
                        || modules.get( dependName );
                }

                var factory = module.factory;
                var exports = typeof factory == 'function'
                    ? factory.apply( this, args )
                    : factory;

                if ( typeof exports != 'undefined' ) {
                    module.exports = exports;
                }

                definedModule[ id ] = module;console.log( 'finished define ' + id );
                var listeners = modulesDefineListener[ id ];
                var len = listeners instanceof Array && listeners.length;
                var arg = {
                    id     : id,
                    module : module.exports
                };

                // fire define event
                if ( len ) {
                    for ( var i = 0; i < len; i++ ) {
                        listeners[ i ]( /*arg*/ );
                    }
                    listeners.length = 0;
                }

                
                delete modulesDefineListener[ id ];
                delete definingModule[ id ];
            },

            /**
             * 添加定义中模块
             * 
             * @param {string} id 模块标识
             * @param {Object} module 模块
             */
            addDefining: function ( id, module ) {
                definingModule[ id ] = module;
            },

            /**
             * 判断模块是否存在
             * 
             * @param {string} id 模块标识
             * @return {boolean}
             */
            exists: function ( id ) {
                return id in definedModule;
            },

            /**
             * 获取模块
             * 
             * @param {string} id 模块标识
             * @return {Object}
             */
            get: function ( id ) {
                return definedModule[ id ] && definedModule[ id ].exports;
            },

            /**
             * 获取定义中模块
             * 
             * @param {string} id 模块标识
             * @return {Object}
             */
            getDefining: function ( id ) {
                return definingModule[ id ];
            },

            /**
             * 添加“模块添加”事件监听器
             * 
             * @param {string} id 模块标识
             * @param {Function} listener 监听器
             */
            addDefineListener: function ( id, listener ) {
                var listeners = modulesDefineListener[ id ];
                if ( !(listeners instanceof Array) ) {
                    listeners = modulesDefineListener[ id ] = [];
                }

                listeners.push( listener );
            }
        };
    })();

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

        // if ( ie && !id ) {
        //     var scripts = document.getElementsByTagName('script');
        //     var scriptLen = scripts.length;
        //     var interactiveScript;
        //     while ( scriptLen-- ) {
        //         interactiveScript = scripts[ scriptLen ];
        //         if ( interactiveScript.readyState == 'interactive' ) {
        //             break;
        //         }
        //     }
        //     id = interactiveScript.getAttribute( 'data-require-id' );
        // }

        currentScriptDefines.push( {
            id      : id,
            deps    : dependencies,
            factory : factory
        } );
    }

    function finishDefine( arg ) {
        var requireModules = [];
        var defineIds = [];
        each(
            currentScriptDefines,
            function ( defineItem, defineIndex ) {
                var id = defineItem.id || arg.moduleId;
                var deps = defineItem.deps;
                var factory = defineItem.factory;
                defineItem.id = id;
                defineIds.push( id );
                if ( modules.exists( id ) ) {
                    throw { message: id + ' is exist!' };
                }

                // process dependencies
                var module = { 
                    id: id, 
                    exports: {}, 
                    factory: defineItem.factory 
                };

                module.buildinModule = {
                    require : function ( requireId, callback ) {
                        return require( resolveId( id, requireId ), callback )
                    },
                    exports : module.exports,
                    module  : module
                };
                modules.addDefining( id, module );

                // init depends
                var depends = [];
                if ( !(deps instanceof Array) || deps.length == 0 ) {
                    deps = [ 'require', 'exports', 'module' ];
                }
                module.factoryDependencies = deps;
                var len = deps.length;
                while ( len-- ) {
                    deps[ len ] = resolveId( id, deps[ len ] );
                }
                depends.push.apply( depends, deps );

                // find require where in factory body
                var matches;
                var factoryBody = factory ? factory.toString() : '';
                var requireRule = /require\(\s*(['"'])([^'"]+)\1\s*\)/g
                while ( ( matches = requireRule.exec( factoryBody ) ) ) {
                    depends.push( matches[ 2 ] );
                }

                // exclude internal module & circle dependency
                var len = depends.length;
                while ( len-- ) {
                    var dependName = resolveId( id, depends[ len ] );
                    if ( dependName in module.buildinModule
                         || isInAfterDefine( defineIndex + 1, dependName )
                         || isInDependencyChain( id, dependName )
                    ) {
                        depends.splice( len, 1 );
                    }
                    else {
                        depends[ len ] = dependName;
                    }
                }

                // process dependencies
                module.dependencies = depends;
                console.log( id + ' depends')
                console.log(depends)

                requireModules.push.apply( requireModules, depends );

                function isInAfterDefine( startIndex, dependName ) {
                    var len = currentScriptDefines.length;
                    for ( ; startIndex < len; startIndex++ ) {
                        if ( dependName == ( currentScriptDefines[ startIndex ].id || arg.moduleId ) ) {
                            return true;
                        }
                    }

                    return false;
                }
            }
        );

        function tryDefineModules() {
            each( 
                defineIds, 
                function ( moduleId ) {
                    modules.define( moduleId );
                }
            );
        }
        each( 
            defineIds, 
            function ( moduleId ) {
                var module = modules.getDefining( moduleId );

                each(
                    module.dependencies,
                    function ( depId ) {
                        if ( modules.exists( depId ) ) {
                            return;
                        }
                        modules.addDefineListener( depId, function () {
                            modules.define( moduleId );
                        } );
                    }
                );
            }
        );
        tryDefineModules();
        
        
        currentScriptDefines.length = 0;
        currentScriptDefines = [];
        
        require( requireModules, new Function() );


        function isInDependencyChain( source, target ) {
            var module = modules.getDefining( target ) || modules.get( target );
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
            if ( modules.exists( id ) ) {
                moduleLoaded[ i ] = 1;
            }
            else {
                moduleLoaded[ i ] = 0;
                modules.addDefineListener( id, getModuleAddListener( i ) );
                loadModule( id );
            }
        }

        finishRequire();
        return modules.get( ids[ 0 ] ) || null;

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
                    callbackArgs.push( modules.get( ids[ i ] ) );
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
        if ( modules.exists( moduleId ) 
             || modules.getDefining( moduleId )
             || loadingModules[ moduleId ]
        ) {
            return;
        }
        
        function loadedListener( evt ) {
            if ( typeof readyState == 'undefined'
                 || readyState == "loaded"
                 || readyState == "complete"
            ) {
                finishDefine( { moduleId: moduleId } );
                delete loadingModules[ moduleId ];
                script.onload = script.onreadystatechange = null;
                script = null;
            }
        }

        // TODO: delete loadingModules
        loadingModules[ moduleId ] = 1;

        // create script element
        var script = document.createElement( 'script' );
        script.setAttribute( 'data-require-id', moduleId );
        script.src = getURL( moduleId );
        if ( ie ) {
            script.onreadystatechange = loadedListener;
        }
        else {
            script.onload = loadedListener;
        }

        appendScript( script );
    }

    /**
     * 向页面中插入script标签
     * 
     * @inner
     * @param {HTMLScriptElement} script script标签
     */
    function appendScript( script ) {
        var doc = document;
        var firstScript = doc.getElementsByTagName( 'script' )[ 0 ];

        if ( firstScript ) {
            firstScript.parentNode.insertBefore( script, firstScript );
        }
        else {
            var parent = doc.getElementsByTagName( 'head' ) [ 0 ] || doc.body;
            parent.appendChild( script );
        }
    }

    function resolveId( currentId, requireId ) {
        if ( /^\./.test( requireId ) ) {
            var terms = currentId.split( '/' );
            terms.length = terms.length - 1;

            each( 
                requireId.split( '/' ), 
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

        return requireId;
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

    // TODO: comform require spec[ https://github.com/amdjs/amdjs-api/wiki/require ]
    var CONF = { 
        baseUrl: './' 
    };

    require.config = function ( conf ) {
        for ( var key in conf ) {
            CONF[ key ] = conf[ key ];
        }
    };
    function getURL( id ) {
        return CONF.baseUrl + id + '.js';
    }
})( window );

