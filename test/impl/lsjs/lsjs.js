/*
    Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
    Available via Academic Free License >= 2.1 OR the modified BSD license.
    see: http://dojotoolkit.org/license for details
*/

var require;
var define;

(function () {
	/* These regexs are taken from requirejs */
    var commentRegExp = /(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg;
	/* Based on the cjs regexs in requirejs, modified slightly */
    var cjsRequireRegExp = /[^\d\w\.]require\(["']([^'"\s]+)["']\)/g;
    
	Iterator = function(array) {
		this.array = array;
		this.current = 0;
	};

	Iterator.prototype = {
		hasMore: function() {
			return this.current < this.array.length;
		},
		next: function() {
			return this.array[this.current++];
		}
	};

	lsImpl = {
		isSupported: function() {
			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch (e) {
				return false;
			}
		},	
		remove: function(key, handler, errorHandler) {
			try {
				var json = localStorage[key];
				if (json !== undefined && json !== null) {
					var value = JSON.parse(json);
					localStorage.removeItem(key);
					if (handler) {
						handler(value);
					}
				} else {
					if (errorHandler) {
						errorHandler("Failed to remove value in local storage ["+key+"]");
					} else {
						console.log("Failed to remove value in local storage ["+key+"]");
					}
				}
			} catch(e) {
				if (errorHandler) {
					errorHandler(e);
				} else {
					console.log("Failed to remove value in local storage ["+key+"] : "+e);
				}
			}
		},
		get: function(key, handler, errorHandler) {
			try {
				var json = localStorage[key];
				if (json !== undefined && json !== null) {
					var value = JSON.parse(json);
					handler(value);
				} else {
					if (errorHandler) {
						errorHandler("Failed to get value in local storage ["+key+"]");
					} else {
						console.log("Failed to get value in local storage ["+key+"]");
					}
				}
			} catch(e) {
				if (errorHandler) {
					errorHandler(e);
				} else {
					console.log("Failed to get value in local storage ["+key+"] : "+e);
				}
			}
		},
		set: function(key, entry, handler, errorHandler) {
			try {
				localStorage[key] = JSON.stringify(entry);
				if (handler) {
					handler(true);
				}
			} catch (e) {
				if (errorHandler) {
					errorHandler(e);
				} else {
					console.log("Failed to set value in local storage ["+key+"] : "+e);
				}
			}
		}
	};
	
	var modules = {};
	var moduleStack = [];
	var paths = {};
	var pkgs = {};
	var reload = {};
	var storage = lsImpl;
	var loaded = {};
	var cache = {};
	var cachets = {};
	var usesCache = {};

	var geval = window.execScript || eval;
	
	var opts = Object.prototype.toString;
	
    function isFunction(it) { return opts.call(it) === "[object Function]"; };
    function isArray(it) { return opts.call(it) === "[object Array]"; };
    function isString(it) { return (typeof it == "string" || it instanceof String); };
    
    function _getParentId() {
    	return moduleStack.length > 0 ? moduleStack[moduleStack.length-1].id : "";
    }
    
	function _normalize(path) {
		var segments = path.split('/');
		var skip = 0;

		for (var i = (segments.length-1); i >= 0; i--) {
			var segment = segments[i];
			if (segment === '.') {
				segments.splice(i, 1);
			} else if (segment === '..') {
				segments.splice(i, 1);
				skip++;
			} else if (skip) {
				segments.splice(i, 1);
				skip--;
			}
		}
		return segments.join('/');
	};
	
	function _expand(path) {
		var isRelative = path.search(/^\./) === -1 ? false : true;
		if (isRelative) {
            var pkg;
            if ((pkg = pkgs[_getParentId()])) {
                path = pkg.name + "/" + path;
            } else {
                path = _getParentId() + "/../" + path;
            }
			path = _normalize(path);
		}
		return path;
	};
	
	function _idToUrl(path) {
		var segments = path.split("/");
		for (var i = segments.length; i >= 0; i--) {
			var pkg;
            var parent = segments.slice(0, i).join("/");
            if (paths[parent]) {
            	segments.splice(0, i, paths[parent]);
                break;
            }else if ((pkg = pkgs[parent])) {
            	var pkgPath;
                if (path === pkg.name) {
                    pkgPath = pkg.location + '/' + pkg.main;
                } else {
                    pkgPath = pkg.location;
                }
    			segments.splice(0, i, pkgPath);
    			break;
            }
		}
		path = segments.join("/");
        if (path.charAt(0) !== '/') {
        	path = cfg.baseUrl + path; 
        }
		path = _normalize(path);
		return path;
	};
	
	function _loadModule(id, cb, scriptText) {
		var expandedId = _expand(id);
		if (modules[expandedId] !== undefined) {
			var count = 0;
			function waitForLoad() {
				count += 100;
				if (count > 10000) {
					throw new Error("timeout while waiting for ["+id+"] to load");
				}
				if (modules[expandedId].exports === undefined) {
					setTimeout(function(){ waitForLoad(); }, 100);
				} else {
					cb(modules[id].exports);
				}
			};
			if (modules[expandedId].exports === undefined) {
				setTimeout(function(){ waitForLoad(); }, 100);
			} else {
				cb(modules[expandedId].exports);
			}
			return;
		}
		modules[expandedId] = {};
		modules[expandedId].id = expandedId;
		
		var url = _idToUrl(expandedId);
    	url += ".js";
    	
		var storedModule;
    	function _load() {
			if (scriptText) {
				_inject(modules[expandedId], scriptText, cb);
			} else if (storedModule === undefined || storedModule === null) {
				_getModule(url, function(_url, scriptSrc, ts) {
					var entry = {url: _url, timestamp: ts};
					loaded[_url] = ts;
					storage.set("loaded!"+window.location.pathname, loaded);
					storage.set(_url, {src: scriptSrc, timestamp: ts});
					_inject(modules[expandedId], scriptSrc, cb);
				});
			} else {
				_inject(modules[expandedId], storedModule.src, cb);
			}
    	};
		if (cfg.forceLoad || url in reload) {
			storage.remove(url, function(){
				_load();
			});
		} else {
			storage.get(url, function(value) {
				storedModule = value;
				_load();
			}, function(error){
				_load();
			});
		}
	};
	
	function _inject(module, scriptSrc, cb) {
		moduleStack.push(module);
		if (cfg.injectViaScriptTag) {
			var script = document.createElement('script');
			script.type = "text/javascript";
			script.charset = "utf-8";
			var scriptContent = document.createTextNode(scriptSrc);
			script.appendChild(scriptContent);
			document.getElementsByTagName("head")[0].appendChild(script);
		} else {
			geval(scriptSrc+"//@ sourceURL="+module.id);
		}
		_loadModuleDependencies(module.id, function(exports){
			moduleStack.pop();
            cb(exports);
        });
	};
	
	function _getModule(url, cb) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url+"?nocache="+new Date().valueOf(), true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					cb(url, xhr.responseText, xhr.getResponseHeader("Last-Modified"));
				} else {
					throw new Error("Unable to load ["+url+"]:"+xhr.status);
				}
			}
		};
		xhr.send(null);				
	};
	
	function _loadModuleDependencies(id, cb) {
		var args = [];
		var m = modules[id];
		m.exports = {};
		var iterate = function(itr) {
			if (itr.hasMore()) {
				var dependency = itr.next();
				if (dependency.match(".+!")) {
					var add = true;
					if (dependency.match("^~#")) {
						dependency = dependency.substring(2);
						add = false;
					}
					var pluginName = dependency.substring(0, dependency.indexOf('!'));
					pluginName = _expand(pluginName);
					var pluginModuleName = dependency.substring(dependency.indexOf('!')+1);
					_loadPlugin(pluginName, pluginModuleName, function(pluginInstance) {
						if (add) {
							args.push(pluginInstance);
						}
						iterate(itr);
					});
				} else if (dependency === 'require') {
					args.push(_createRequire(_getParentId()));
					iterate(itr);
				} else if (dependency === 'module') {
					args.push(m);
					iterate(itr);
				} else if (dependency === 'exports') {
					args.push(m.exports);
					iterate(itr);
				} else {
					var add = true;
					if (dependency.match("^~#")) {
						dependency = dependency.substring(2);
						add = false;
					}
					_loadModule(dependency, function(module){
						if (add) {
							args.push(module);
						}
						iterate(itr);
					});
				}
			} else {
				if (m.factory !== undefined) {
					if (args.length < 1) {
						var req = _createRequire(_getParentId());
						args = args.concat(req, m.exports, m);
					}
					var ret = m.factory.apply(null, args);
					if (ret) {
						m.exports = ret;
					}
				} else {
					m.exports = m.literal;
				}
				cb(m.exports);
			}
		};
		iterate(new Iterator(m.dependencies));
	};
	
	function _loadPlugin(pluginName, pluginModuleName, cb) {
		_loadModule(pluginName, function(plugin){
			if (plugin.normalize) {
				pluginModuleName = plugin.normalize(pluginModuleName, _expand); 
			} else {
				pluginModuleName = _expand(pluginModuleName);
			}
			var isDynamic = plugin.dynamic || false; 
			if (modules[pluginName+"!"+pluginModuleName] !== undefined && !isDynamic) {
				cb(modules[pluginName+"!"+pluginModuleName].exports);
				return;
			}
			var req = _createRequire(pluginName);
			var load = function(pluginInstance){
		    	modules[pluginName+"!"+pluginModuleName] = {};
		    	modules[pluginName+"!"+pluginModuleName].exports = pluginInstance;
		    	if (!isDynamic && pluginName in usesCache) {
		    		var url = _idToUrl(pluginModuleName);
		    		if (cache[url] === undefined || url in reload) {
		    			_getLastModified(url, function(lastModified){
		    				if (lastModified) {
			    				cachets[url] = lastModified;
				    			_storeCache();
		    				}
		    			});
		    			cache[url] = pluginInstance;
		    			_storeCache();
		    		}
		    	}
				cb(pluginInstance);
			};
			load.fromText = function(name, text) {
				_loadModule(name, function(){}, text);				
			};
			plugin.load(pluginModuleName, req, load, cfg);
		});
	};
	
	function _createRequire(id) {
		var req = function(dependencies, callback) {
			var root = modules[id];
			var savedStack = moduleStack;
			moduleStack = [root];
			if (isFunction(callback)) {
				_require(dependencies, function() {
					moduleStack = savedStack;
					callback.apply(null, arguments);
				});
			} else {
				var mod = _require(dependencies, callback);
				moduleStack = savedStack;
				return mod;
			}
		};
		req.toUrl = function(moduleResource) {
			var url = _idToUrl(_expand(moduleResource)); 
			return url;
		};
		req.defined = function(moduleName) {
			return _expand(moduleName) in modules;
		};
		req.specified = function(moduleName) {
			return _expand(moduleName) in modules;
		};
		req.ready = function(callback) {
			if (pageLoaded) {
				callback();
			} else {
				readyCallbacks.push(callback);
			}
		};
		req.nameToUrl = function(moduleName, ext, relModuleMap) {
			return moduleName + ext;
	    };
        // Dojo specific require properties and functions
        req.cache = cache;
        req.toAbsMid = function(id) {
        	return _expand(id);
        };
        req.isXdUrl = function(url) {
        	return false;
        };
		return req;
	};
	
	function _getTimestamps(timestampUrl, cb) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", timestampUrl, true);
		xhr.setRequestHeader("Content-Type", "application/json");

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var urlsToReload = JSON.parse(xhr.responseText);
					for (var i = 0; i < urlsToReload.length; i++) {
						reload[urlsToReload[i]] = urlsToReload[i];
					}
					cb();
				} else {
					throw new Error("Unable to get timestamps via the url ["+timestampUrl+"]:"+xhr.status);
				}
			}
		};
		var current = [];
		var url;

		for (url in loaded) {
			current.push({url: url, timestamp: loaded[url]});
		}
		for (url in cachets) {
			current.push({url: url, timestamp: cachets[url]});
		}
		xhr.send(JSON.stringify(current));
	};

	function _getLastModified(url, cb) {
		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					cb(xhr.getResponseHeader("Last-Modified"));
				} else {
					cb();
				}
			}
		};
		xhr.send(null);
	};

	function _storeCache() {
		var storedCache = {};
		for (var url in cache) {
			storedCache[url] = {value: cache[url], timestamp: cachets[url]};
		}
		storage.set("cache!"+window.location.pathname, storedCache);
	};

	define = function (id, dependencies, factory) {
		if (!isString(id)) {
			factory = dependencies;
			dependencies = id;
			id = _getParentId();
		}
		if (!isArray(dependencies)) {
			factory = dependencies;
			dependencies = [];
		}
		if (isFunction(factory)) {
			factory.toString().replace(commentRegExp, "").replace(cjsRequireRegExp, function (match, dep) {
				dependencies.push("~#"+dep);
            });
			modules[id].factory = factory;
		} else {
			modules[id].literal = factory;
		}
		modules[id].dependencies = dependencies; 
	};
	
    define.amd = {
        plugins: true,
        jQuery: true
    };

	_require = function (dependencies, callback) {
		if (isString(dependencies)) {
			var id = dependencies;
			id = _expand(id);
			if (id.match(".+!")) {
				var pluginName = id.substring(0, id.indexOf('!'));
				pluginName = _expand(pluginName);
				var plugin = modules[pluginName].exports;
				var pluginModuleName = id.substring(id.indexOf('!')+1);
				if (plugin.normalize) {
					pluginModuleName = plugin.normalize(pluginModuleName, function(path){
						return _expand(path);
					});
				} else {
					pluginModuleName = _expand(pluginModuleName);
				}
				id = pluginName+"!"+pluginModuleName;
			}
			return modules[id] === undefined ? undefined : modules[id].exports;
		} else if (isArray(dependencies)) {
			var args = [];
			var iterate = function(itr) {
				if (itr.hasMore()) {
					var dependency = itr.next();
					if (dependency.match(".+!")) {
						var pluginName = dependency.substring(0, dependency.indexOf('!'));
						pluginName = _expand(pluginName);
						var pluginModuleName = dependency.substring(dependency.indexOf('!')+1);
						_loadPlugin(pluginName, pluginModuleName, function(pluginInstance) {
							args.push(pluginInstance);
							iterate(itr);
						});
					} else {
						_loadModule(dependency, function(module){
							args.push(module);
							iterate(itr);
						});
					}
				} else if (callback !== undefined) {
					callback.apply(null, args);
				}
			};
			iterate(new Iterator(dependencies));
			return undefined;
		}
	};
	
	modules["require"] = {};
	modules["require"].exports = _require;
	var cfg = {baseUrl: "./"};

	lsjs = function(config, dependencies, callback) {
		if (!isArray(config) && typeof config == "object") {
			var i;
			cfg = config;
			if (cfg.paths) {
				for (var p in cfg.paths) {
					var path = cfg.paths[p];
					paths[p] = path;
				}
			}
			if (cfg.packages) {
				for (i = 0; i < cfg.packages.length; i++) {
					var pkg = cfg.packages[i];
					pkgs[pkg.name] = pkg;
				}
			}
			if (cfg.storageImpl) {
				storage = cfg.storageImpl;
				var requiredProps = ["get", "set", "remove", "isSupported"];
				for (i = 0; i < requiredProps.length; i++) {
					if (!storage[requiredProps[i]]) {
						throw new Error("Storage implementation must implement ["+requiredProps[i]+"]");
					}
				}
			}
			if (cfg.usesCache) {
				for (i = 0; i < cfg.usesCache.length; i++) {
					usesCache[cfg.usesCache[i]] = true;
				}
			}
			cfg.baseUrl = cfg.baseUrl || "./";
		} else {	
			callback = dependencies;
			dependencies = config;
		}
		if (cfg.baseUrl.charAt(0) !== '/') {
			cfg.baseUrl = _normalize(window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/'+ cfg.baseUrl);
		}
		if (!storage.isSupported()) {
			throw new Error("Storage implementation is unsupported");
		}

		storage.get("loaded!"+window.location.pathname, function(value){
			loaded = value;
		}, function(error){});

		storage.get("cache!"+window.location.pathname, function(storedcache) {
			for (var url in storedcache) {
				cache[url] = storedcache[url].value;
				cachets[url] = storedcache[url].timestamp;
			}
		}, function(error){});

		if (!isArray(dependencies)) {
			callback = dependencies;
			dependencies = [];
		}
		function callRequire(dependencies, callback) {
			if (isFunction(callback)) {
				_require(dependencies, function() {
					callback.apply(null, arguments);
				});
			} else {
				_require(dependencies);
			}
		};
		if (cfg.timestampUrl) {
			_getTimestamps(cfg.timestampUrl, function(){
				callRequire(dependencies, callback);
			});
		} else {
			callRequire(dependencies, callback);
		}
	};
	
	var pageLoaded = false;
	var readyCallbacks = [];
    
	document.addEventListener("DOMContentLoaded", function() {
		pageLoaded = true;
		for (var i = 0; i < readyCallbacks.length; i++) {
			readyCallbacks[i]();
		}
	}, false);
	
	if (!require) {
		require = _require;
		require.toUrl = function(moduleResource) {
			var url = _idToUrl(_expand(moduleResource));
			return url;
		};
	}
}());
