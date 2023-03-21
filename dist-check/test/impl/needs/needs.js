/*
 * needs.js v0.9.5
 * http://minion.org
 *
 * (c) 2012, Taka Kojima (taka@gigafied.com)
 * Licensed under the MIT License
 *
 * Date: Sun Feb 26 15:24:15 2012 -0800
 */
 (function (root) {

    /** 
    * You will see the use of `~` throughout the code.
    * `~(Number)` will return true for anything other than -1,
    * Essentially another way of doing `>= 0`, just less bytes
    */

    Array.prototype.indexOf = Array.prototype.indexOf || function (a, b, c, r) {
        for (b = this, c = b.length, r = -1; ~c; r = b[--c] === a ? c : r);
        return r;
    };

    var _loadQ = [],
        _defineQ = [],
        _loadedFiles = {},
        _modules = {},
        _head,
        // Used for checking circular dependencies.
        _dependencies = {},
        // Used in various places, defined here for smaller file size
        _rem = ["require", "exports", "module"],

        // Configurable properties...
        _config = {},
        _baseUrl = "",
        _urlArgs = "",
        _waitSeconds = 10,
        _paths = {};


    function _isArray (a) {
        return a instanceof Array;
    }

    /** 
    * Normalizes a path/url, cleaning up duplicate slashes,
    * takes care of `../` and `./` parts
    */
    function _normalize (path, prevPath) {
        // Replace any matches of "./"  with "/"
        path = path.replace(/(^|[^\.])(\.\/)/g, "$1");

        // Replace any matches of "some/path/../" with "some/"
        while (prevPath !== path) {
            prevPath = path;
            path = path.replace(/([\w,\-]*[\/]{1,})([\.]{2,}\/)/g, "");
        }

        // Replace any matches of multiple "/" with a single "/"
        return path.replace(/(\/{2,})/g, "/");
    }

    /** 
    * Similar to UNIX dirname, returns the parent path of another path.
    */
    function _getContext (path) {
        return path.substr(0, path.lastIndexOf("/"));
    }

    /** 
    * Given a path and context (optional), will normalize the url
    * and convert a relative path to an absolute path.
    */
    function _resolve (path, context) {

        /** 
        * If the path does not start with a ".", it's relative
        * to the base URL.
        */
        context = (path.indexOf(".") < 0) ? "" : context;

        /**
        * Never resolve "require", "module" and "exports" to absolute paths
        * For plugins, only resolve the plugin path, not anything after the first "!"
        */
        if (~_rem.indexOf(path) || ~path.indexOf("!")) {
            return path.replace(/([\d,\w,\s,\.\/]*)(?=\!)/, function ($0, $1) {
                return _resolve($1, context);
            });
        }

        return _normalize((context ? context + "/" : "") + path);
    }

    /** 
    * Loop through all of the items in _loadQ and if all modules in a given
    * queue are defined, call the callback function associated with the queue.
    */
    function _checkLoadQ (i, j, q, ready) {

        for (i = _loadQ.length - 1; ~i && (q = _loadQ[i]); i --) {

            ready = 1;
            for (j = q.m.length - 1; ~j && ready; j --) {
                ready = _module(q.m[j]);
            }
            if (ready) {
                _loadQ.splice(i, 1);
                require(q.m, q.cb);
            }
        }
    }

    /**
    * Invokes the first anonymous item in _defineQ.
    * Called from script.onLoad, and loader plugins .fromText() method.
    */
    function _invokeAnonymousDefine (id, q) {
        if (_defineQ.length) {
            q = _defineQ.splice(0,1)[0];
            if (q) {
                /**
                * If the q is not null, it's an anonymous module and we have to invoke define()
                * But first we need to tell the q which id to use, and set alreadyQed to true.
                */
                q.splice(0,0, id); // set the module id
                q.splice(q.length,0, 1); // set alreadyQed to true
                define.apply(root, q);
            }
        }
    }

    /** 
    * Injects a script tag into the DOM
    */
    function _inject (f, m, script, q, isReady, timeoutID) {
        
        _head = _head || document.getElementsByTagName('head')[0];

        script = document.createElement("script");
        script.src = f;

        /**
        * Bind to load events, we do it this way vs. addEventListener for IE support.
        * No reason to use addEventListener() then fallback to script.onload, just always use script.onload;
        */
        script.onreadystatechange = script.onload = function () {

            if (!script.readyState || script.readyState === "complete" || script.readyState === "loaded") {
                
                clearTimeout(timeoutID);
                script.onload = script.onreadystatechange = script.onerror = null;

                _invokeAnonymousDefine(m);
            }
        };

        /**
        * script.onerror gets called in two ways.
        * The first, if a script request actually errors (i.e. a 404)
        * The second, if a script takes more than X seconds to respond. Where X = _waitSeconds
        */
        script.onerror = function (e) {
            
            clearTimeout(timeoutID);
            script.onload = script.onreadystatechange = script.onerror = null;

            throw new Error(f + " failed to load.");
        };

        timeoutID = setTimeout(script.onerror, _waitSeconds * 1000);

        // Prepend the script to document.head
        _head.insertBefore(script, _head.firstChild);

        return 1;
    }

    /** 
    * Does all the loading of modules and plugins.
    */
    function _load (modules, callback, context, i, q, m, f) {

        q = {m: modules, cb: callback};
        _loadQ.push(q);

        for (i = 0; i < modules.length; i ++) {
            m = modules[i];
            if (~m.indexOf("!")) {
                /**
                * If the module id has a "!"" in it, it's a plugin...
                */
                _loadPluginModule(m, context, q, i);
                continue;
            }

            /**
            * Otherwise, it's normal module, not a plugin. Inject the file into the DOM if
            * the file has not been loaded yet and if the module is not yet defined.
            */
            f = _getURL(m);
            _loadedFiles[f] = (!_module(m) && !_loadedFiles[f]) ? _inject(f, m) : 1;
        }
    }

    /** 
    * Called by _load() and require() used for loading and getting plugin-type modules
    */
    function _loadPluginModule (module, context, q, moduleIndex, definition, plugin, pluginPath) {
    
        /** 
        * Set the plugin path. Plugins are stored differently than normal modules
        * Essentially they are stored along with the context in a special "plugins"
        * property. This allows modules to lookup plugins with the sync require("index!./foo:./bar") method
        */
        pluginPath = (context ? context + "/" : "") + "plugins/" + module.replace(/\//g, "_");

        /*
        * Let's check to see if the module is already defined.
        */
        definition = _module(pluginPath);

        /*
        * If no load queue is specified, then this function was invoked from require()
        * Return whether or not the plugin has been defined yet.
        * If the plugin is defined, no need to do anything else, so return.
        */

        if (!q || definition) {
            return definition;
        }

        /*
        * Update the path to this plugin in the queue
        */
        q.m[moduleIndex] = pluginPath;

        module = module.split("!");
        plugin = module.splice(0,1)[0];
        module = module.join("!");

        /**
        * Let's make sure the plugin is loaded before we do anything else.
        */
        require(plugin, function (pluginModule) {

            /**
            * If the plugin module has a normalize() method defined, use it
            */
            module = pluginModule.normalize ? 
                pluginModule.normalize(module, function (path) {
                    return _resolve(path, context);
                }) : 
                _normalize(module);

            function load (definition) {
                _module(pluginPath, {exports: definition});
                _checkLoadQ();
            }

            load.fromText = function (name, definition, dqL) {

                /**
                * Update the module path in the load queue with the newly computed module id
                */
                q.m[moduleIndex] = pluginPath = name;

                /**
                * Store the length of the define queue, to check against after the eval().
                */
                dqL = _defineQ.length;

                /** 
                * Yes, eval/Function is bad, evil. I hate it, you hate it, but some plugins need it.
                * If you don't have any plugins using fromText(), feel free to comment 
                * the entire load.fromText() out and re-minify the source.
                * I use Function vs eval() because nothing executing through fromText() should need access
                * to local vars, and Uglify does not mangle variables if it finds "eval()" in your code.
                */

                /*jslint evil: true */
                new Function(definition)();

                if(_defineQ.length-dqL) {
                    // Looks like there was a define call in the eval'ed text.
                    _invokeAnonymousDefine(pluginPath);
                }
            };

            return pluginModule.load(
                module,
                require.localize(_getContext(plugin)),
                load,
                _config[plugin] || {}
            );
        });
    }

    /**
    * Gets the module by `id`, otherwise if `def` is specified, define a new module.
    */
    function _module (id, def, noExports, ns, i, l, parts, pi) {

        /**
        * Always return back the id for "require", "module" and "exports",
        * these are replaced by calling _swapValues
        */
        if (~_rem.indexOf(id)) {
            return id;
        }

        ns = _modules;
        parts = id.split("/");

        for (i = 0, l = parts.length; i < l; i ++) {
            pi = parts[i];
            if (!ns[pi] || (!ns[pi].exports && l-i==1)) {
                if (!def) {
                    /**
                    * The module is not yet defined, and no definition
                    * was supplied, so return false.
                    */
                    return 0;
                }
            }

            /**
            * If a definition was specified and we are
            * at the last part of the path, store the definition.
            */
            ns[pi] = (l-i==1 && def) ? def : (ns[pi] || {});

            ns = ns[pi];
        }
        /**
        * noExports is set to true from within define, to get back the full module object.
        * If noExports != true, then we return the exports property of the module.
        */ 
        return noExports ? ns : ns.exports;
    }

    /**
    * Gets the URL for a module by `id`. Paths passed to _getURL must be absolute.
    * To get URLs for relative paths use require.toUrl(id, context)
    */
    function _getURL (id, prefix) {

        /** 
        * If the path starts with a "/", or "http", it's an absolute URL
        * If it's not an absolute URL, prefix the request with baseUrl
        */
        prefix = (!id.indexOf("/") || !id.indexOf("http")) ? "" : _baseUrl;


        for(var p in _paths) {
            id = id.replace(new RegExp("(^" + p + ")", "g"), _paths[p]);
        }

        return prefix + id + (id.indexOf(".") < 0 ? ".js" : "") + _urlArgs;
    }

    /**
    * Takes an array as the first argument, and an object as the second.
    * Replaces any values found in the array, with values in the object.
    */
    function _swapValues (a, s, j) {
        for (var i in s) {
            j = a.indexOf(i);
            if (~j) {
                a[j] = s[i];
            }
        }
        return a;
    }

    /**
    * Stores dependencies for this module id.
    * Also checks for any circular dependencies, if found, it defines those modules as empty objects temporarily
    */
    function _resolveCircularReferences (id, dependencies, circulars, i, j, d, subDeps, sd, cid) {
        
        _dependencies[id] = dependencies;
    
        /**
        * Check for any dependencies that have circular references back to this module
        */
        for (i = 0; i < dependencies.length; i ++) {
            d = dependencies[i];
            subDeps = _dependencies[d];
            if (subDeps) {
                for (j = 0; j < subDeps.length; j ++) {
                    sd = subDeps[j];
                    if (dependencies.indexOf(sd) < 0) {
                        if (sd !== id) {
                            dependencies.push(sd);
                        }
                        else{
                            /**
                            * Circular reference detected, define circular
                            * references as empty modules to be defined later
                            */
                            _module(d, {exports : {}});
                        }
                    }
                }
            }
        }
    }
    
    /**
    * Define modules. AMD-spec compliant.
    */
    function define (id, dependencies, factory, alreadyQed, depsLoaded, module, facArgs, context, ri) {

        if (typeof id !== 'string') {
            /**
            * No id means that this is an anonymous module,
            * push it to a queue, to be defined upon onLoad
            */
            factory = dependencies;
            dependencies = id;
            id = 0;

            _defineQ.push([dependencies, factory]); 
            return;
        }

        if (!_isArray(dependencies)) {
            factory = dependencies;
            dependencies = [];
        }

        if (!alreadyQed) {
            /**
            * ID was specified, so this is not an anonymous module,
            * However, we still need to add an empty queue here to be cleaned up by onLoad
            */
            _defineQ.push(0);
        }

        context = _getContext(id);

        /**
        * No dependencies, but the factory function is expecting arguments?
        * This means that this is a CommonJS-type module...
        */
        if (!dependencies.length && factory.length && typeof factory === "function") {

            /**
            * Let's check for any references of sync-type require("moduleID")
            */
            factory.toString()
                .replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, "") // Remove any comments first
                .replace(/(?:require)\(\s*["']([^'"\s]+)["']\s*\)/g, // Now let's check for any sync style require("module") calls

                    function ($0, $1) {
                        if (dependencies.indexOf($1) < 0) {
                            /**
                            * We're not actually replacing anyting inside factory.toString(),
                            * but this is a nice, clean, convenient way to add any
                            * sync-type require() matches to the dependencies array.
                            */
                            dependencies.push($1);
                        }
                    }
                );

            dependencies = (_rem.slice(0,factory.length)).concat(dependencies);
        }

        if (dependencies.length && !depsLoaded) {

            /**
            * Dependencies have not been loaded yet, so let's call require() to load them
            * After the dependencies are loaded, reinvoke define() with depsLoaded set to true.
            */
            _resolveCircularReferences(id, dependencies.slice(0));

            require(dependencies, function () {
                define(id, Array.prototype.slice.call(arguments, 0), factory, 1, 1);
            }, context);

            return;
        }

        /**
        * At this point, we know all dependencies have been loaded,
        * and `dependencies` is an actually array of modules, not their ids
        * Get the module if it has already been defined, otherwise let's create it
        */

        module = _module(id, 0, 1);
        module = module || {exports: {}};

        module.id = id;
        module.url = _getURL(id);

        if (typeof factory === "function") {

            /**
            * If the factory is a function, we need to invoke it.
            * First let's swap "require", "module" and "exports" with actual objects
            */
            facArgs =_swapValues(
                dependencies.length ? dependencies : (_rem.slice(0,factory.length)),
                {
                    "require" : require.localize(context),
                    "module" : module,
                    "exports" : module.exports
                }
            );

            /**
            * In some scenarios, the global require object might have slipped through,
            * If so, replace it with a localized require.
            */
            ri = facArgs.indexOf(require);
            if (~ri) {
                facArgs[ri] = require.localize(context);
            }

            /**
            * If the function returns a value, then use that as the module definition
            * Otherwise, assume the function modifies the exports object.
            */
            module.exports = factory.apply(factory, facArgs) || module.exports;
        }
        else{
            /**
            * If the factory is not a function, set module.exports to whatever factory is
            */
            module.exports = factory;
        }

        /**
        * Make the call to define the module.
        */
        _module(id, module);

        /**
        * Clear the dependencies from the _dependencies object.
        * _dependencies gets checked regularly to resolve circular dependencies
        * and if this module had any circulars, they have already been resolved.
        */
        delete _dependencies[id];

        /**
        * Now let's check the _loadQ
        */
        _checkLoadQ();
    }

    /**
    * Our define() function is an AMD implementation
    */
    define.amd = {};

    /**
    * Asynchronously loads in js files for the modules specified.
    * If all modules are already defined, the callback function is invoked immediately.
    * If id(s) is specified but no callback function, attempt to get the module and
    * return the module if it is defined, otherwise throw an Error.
    */
    function require (ids, callback, context, plugins, i, modules) {

        if (!callback) {
            /**
            * If no callback is specified, then try to get the module by it's ID
            */
            ids = _resolve(ids, context);
            callback = _module(ids);
            if (!callback) {
                plugin = _loadPluginModule(ids, context);
                if (plugin) {
                    return plugin;
                }
                throw new Error(ids + " is not defined.");
            }
            /**
            * Otherwise return the module's definition.
            */
            return callback;
        }

        ids = (!_isArray(ids)) ? [ids] : ids;
        modules = [];

        for (i = 0; i < ids.length; i ++) {
            /**
            * Convert all relative paths to absolute paths,
            * Then check to see if the modules are already defined.
            */
            ids[i] = _resolve(ids[i], context);
            modules.push(_module(ids[i]));
        }

        if (~modules.indexOf(0)) {
            /**
            * If any one of the modules is not yet defined, we need to 
            * wait until the undefined module(s) are loaded, so call load() and return.
            */
            _load(ids, callback, context);
            return;
        }

        /**
        * Otherwise, we know all modules are already defined.
        * Invoke the callback immediately, swapping "require" with the actual require function
        */
        return callback.apply(root, _swapValues(modules, {"require" : require}));
    }

    /**
    * Configure NeedsJS, possible configuration properties are:
    *
    *    - baseUrl
    *    - urlArgs
    *    - waitSeconds
    */
    require.config = function (obj) {
        _config = obj || {};

        _baseUrl = _config.baseUrl || _baseUrl;
        // Add a trailing slash to baseUrl if needed.
        _baseUrl += (_baseUrl && _baseUrl.charAt(_baseUrl.length-1) !== "/") ? "/" : ""; 

        _urlArgs = _config.urlArgs ? "?" + _config.urlArgs : _urlArgs;

        _waitSeconds = _config.waitSeconds || _waitSeconds;

        for (var p in _config.paths) {
            _paths[p] = _config.paths[p];
        }
    };

    /**
    * Get a url for a relative id.
    * You do not need to specify `context` if calling this from within a define() call,
    * or a localized version of require();
    */
    require.toUrl = function (id, context) {
        return _getURL(_resolve(id, context));
    };

    /**
    * Returns a localized version of require, so that modules do not need
    * to specify their own id, when requiring relative modules, or resolving relative urls.
    */
    require.localize = function (context) {

        function localRequire (ids, callback) {
            return require(ids, callback, context);
        }

        localRequire.toUrl = function (id) {
            return require.toUrl(id, context);
        };

        return localRequire;
    };

    /**
    * Define global define/require methods, unless they are already defined.
    */
    root.define = root.define || define;
    root.require = root.require || require;

/**
* If we're in a browser environment use window as the root object
* Otherwise, assume we're in a CommonJS environment and use exports
*/
})(window || exports);
