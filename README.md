ESL (Enterprise Standard Loader)
=====================

ESL是一个`浏览器端`、`符合AMD`的标准加载器，适合用于现代Web浏览器端应用的入口与模块管理。

ESL is a browser-only, amd-compliant module loader. In modern web applications, it is normally used in startup script or as a module manager.


### 了解AMD (About AMD)

- [前端为什么需要模块化? (WHY WEB MODULES?)](http://requirejs.org/docs/why.html)
- [为什么需要使用AMD? (WHY AMD?)](http://requirejs.org/docs/whyamd.html)
- [玩转AMD系列 - 设计思路篇](http://efe.baidu.com/blog/dissecting-amd-what/)
- [玩转AMD系列 - 应用实践篇](http://efe.baidu.com/blog/dissecting-amd-how/)
- [玩转AMD系列 - Loader篇](http://efe.baidu.com/blog/dissecting-amd-loader/)
- [AMD spec](https://github.com/amdjs/amdjs-api/wiki/AMD)
- [AMD Require](https://github.com/amdjs/amdjs-api/wiki/require)
- [AMD Common-Config](https://github.com/amdjs/amdjs-api/wiki/Common-Config)
- [AMD Loader-Plugins](https://github.com/amdjs/amdjs-api/wiki/Loader-Plugins)


### ESL vs RequireJS

- 具有`更小的体积` (Smaller) 
- 具有`更高的性能` (Higher performance)
- 不支持在`非浏览器端`使用 (Browser only)
- 依赖模块`用时定义` (Lazy define)
- 支持`noRequests`指定无需请求的模块 (noRequests is supported)
- 尚未支持以下配置项：`shim` (`shim` is not supported)


### ESL的配置项 (CONFIGURATION OPTIONS)

查看 [ESL的配置文档](doc/config.md)

See [Configuration Options](doc/config.md)


### CDN

当前版本的CDN引用：(latest)

```html
<!-- compressed -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-8/esl.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-8/esl.source.js"></script>
```

[过往版本 (Old version)](CDN.md)


### 体积对比 (FILE SIZES)

`uglifyjs -mc + gzip`

- `esl 1.8.6 normal` 3.4k
- `esl 1.8.6 min` 3.1k
- `requirejs 2.1.15` 6.2k


### 性能对比 (PERFORMANCE)

查看 [wiki文档](https://github.com/ecomfe/esl/wiki/1.8.0-%E6%A8%A1%E5%9D%97%E5%8A%A0%E8%BD%BD%E6%97%B6%E9%97%B4%E6%B5%8B%E8%AF%95%E7%BB%93%E6%9E%9C%E8%AE%B0%E5%BD%95)

See [wiki page](https://github.com/ecomfe/esl/wiki/1.8.0-%E6%A8%A1%E5%9D%97%E5%8A%A0%E8%BD%BD%E6%97%B6%E9%97%B4%E6%B5%8B%E8%AF%95%E7%BB%93%E6%9E%9C%E8%AE%B0%E5%BD%95)


### 了解ESL的进化史 (CHANGE LOG)

[了解ESL的进化史(CHANGE LOG)](CHANGELOG.md)


