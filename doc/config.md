配置你的Loader
--------

通过`require.config( Object )`，可以对esl进行配置。通常我们在使用前都需要进行esl的配置。

```javascript
require.config( {
    baseUrl: './src',
    paths: {
        css: './src/plugin/css'
    }
} );

require( [ 'common/main' ] );
```


ESL的配置项
--------

### baseUrl

`string`

[AMD](https://github.com/amdjs/amdjs-api/wiki/Common-Config) 标准配置项。指定模块的根路径。


### paths

`Object`

[AMD](https://github.com/amdjs/amdjs-api/wiki/Common-Config) 标准配置项。为特殊模块指定查找路径。

配置项中，每项的key为模块id，value为指定路径。key的模块id为前缀匹配。

```javascript
require.config( {
    baseUrl: './src',
    paths: {
        lib: 'http://lib.com/libpath', // 引用外部模块可以用paths配置
        plugin: './plugin' // 前缀匹配，plugin/css和plugin/js等模块都将到 "./plugin"下查找
    }
} );
```

### packages

`Array`

[AMD](https://github.com/amdjs/amdjs-api/wiki/Common-Config) 标准配置项。package是一个功能集合的抽象，通过packages配置可以引入一个符合CommonJS规范的包。

配置项中，数组中的每项可以是：

+ `Object`，其中包含`name`、`location`、`main`。
+ `string`，其中第一个segment作为`name`，整个字符串的值作为`location`，`main`采用默认值main。

```javascript
require.config( {
    // ...

    packages: [
        {
            name: 'er',
            location: '../dep/er/3.0.2'
        },
        {
            name: 'echarts',
            location: '../dep/echarts/1.1.0',
            main: 'echarts'
        }
    ]
} );
```


### map

`Object`

[AMD](https://github.com/amdjs/amdjs-api/wiki/Common-Config) 标准配置项。map项允许用户对依赖的模块进行映射。

和`paths`配置项一样，key的模块id为前缀匹配。

```javascript
require.config( {
    // ...
    
    // some/newmodule模块中，require('foo')实际引用到的是foo2模块
    // some/newmodule为前缀匹配，some/newmodule/index对foo的引用行为也将引用foo2
    'some/newmodule': {
        'foo': 'foo2',
        'foo/bar': 'foo1.2/bar3'
    }
} );
```



### config

`Object`

[AMD](https://github.com/amdjs/amdjs-api/wiki/Common-Config) 标准配置项。通过config配置可以为模块传递需要动态变更的参数，比如功能开关。

```javascript
require.config( {
    // ...

    config: {
        sidebar: {
            displayMode: 'autohide'
        }
    }
} );
```

模块可以通过`module.config()`获得其自身配置。

```javascript
define( function ( require, exports, module ) {
    var conf = module.config();
} );
```


### waitSeconds

`Interger`

非AMD标准配置项，指定等待的秒数。超过等待时间后，如果有模块未成功加载或初始化，将抛出 *MODULE_TIMEOUT* 异常错误信息。

```javascript
require.config( {
    // ...

    waitSeconds: 5
} );

require( [ 'noexist' ] );
```


### urlArgs

`string` | `Object`

非AMD标准配置项，在模块路径后添加参数字符串。

+ `string`: 默认参数字符串。
+ `Object`: 为相应模块指定参数字符串。与`paths`、`map`配置项相同，key为前缀匹配。

```javascript
require.config( {
    // ...

    urlArgs: 'v=2.0.0' // 指定所有模块的路径后参数
} );
```

```javascript
require.config( {
    // ...

    urlArgs: {
        common: '1.2.0' // 为common和common下的子模块指定路径后参数
    }
} );
```


更改urlArgs将导致相关模块的缓存全部失效。除非系统升级时对用户更新时效性要求非常高，不建议使用`urlArgs`配置项。


### noRequests

`Object`

非AMD标准配置项，指定哪些模块不需要发送网络请求。通常用于在生产环境下，为优化网络连接进行模块合并。

+ `key`为`string`。和`map`配置项一样，key的模块id为前缀匹配。
+ `value`为`Array | string`，可指定一个或多个模块id，完整匹配，支持`*`表示所有模块。

在同一个异步require的调用中，如果存在`value`指定的模块，则认为被`key`匹配的模块的声明被合并在`value`指定的模块中，被`key`匹配的模块不发送网络请求。

```javascript
require.config( {
    // ...

    noRequests: {
        'report': 'main',
        'zrender/shape': 'zrender'
    }
} );

// report/daily 将发送请求
require( 
    [ 'report/daily' ], 
    function ( daily ) {
        // ......
    }
);

// report/weekly 将不发送请求
require( 
    [ 'report/weekly', 'main' ], 
    function ( weekly, main ) {
        // ......
    }
);

// zrender/shape/Text 将不发送请求
require( 
    [ 'zrender', 'zrender/shape/Text' ], 
    function ( zrender, TextShape ) {
        // ......
    }
);
```

