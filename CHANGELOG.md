
2.2.0
-------

+ 新特性：增加`addLoader`方法，允许自定义加载过程
+ 新特性：增加`onNodeCreated` Hook，允许用户为加载的script元素扩展属性
+ 新特性：增加`require.fetch`方法，预取但不定义模块
+ 新特性：增加模块状态相关的Hook，包括`onModulePreDefined`、`onModuleAnalyzed`、`onModulePrepared`、`onModuleDefined`
+ bug修复：bundle为packages时，请求地址不正确

2.1.6
-------

+ bug修复：packages配置合并时，如果出现重复的name，后者无法覆盖前者

2.1.4
-------

+ bug修复：当同时async require多个模块，并且模块有依赖包含关系时，初始化时机提前导致失败


2.1.2
-------

+ bug修复：map配置当 `id前缀` 和 `*` 同时存在时，配置信息未merge的问题
+ 优化：对错误提示信息进行了优化

2.1.0
-------

+ bug修复：当shim的模块为function时，会做为factory自动执行。应该不执行，将此function做为shim的模块

2.0.8
-------

+ 新特性：增加`data-main`的支持。
+ 优化：优化relative2absolute函数。

2.0.6
-------

+ bug修复：依赖被map到package的主模块时，模块加载失败。
+ bug修复：require.toUrl对package.suffix参数的返回值错误。


2.0.4
-------

+ bug修复：当模块的依赖模块及其依赖资源已经ready时，模块加载完成后状态可能导致回退。
+ bug修复：bundles配置项中包含package时，仍然会发起对package的请求。



2.0.2
-------

+ 健壮性修复：模块由于自身原因无法运行通过时，避免可能影响其他async require，导致callback运行失效。



2.0.0
-------

+ 支持shim配置项
+ 删除了noRequests配置项对打包模式时避免无用请求的支持
+ 支持和requirejs相同的配置项bundles，代替原noRequests的避免无用请求的功能
+ 模块加载过程优化


1.8.8
-------

+ 更改全局变量的暴露方式，使require和define能够使用闭包的方式包装
+ 对代码进行两处简单的小优化，删除无用变量
+ 代码格式符合新规范


1.8.6
-------

+ 删除parse id时的验证，用于支持不标准的id (比如id中包含冒号等特殊符号)
+ 内联的script中包含define时，不自动完成模块初始化，初始化时机在async require时开始
+ 打包合并的预定义模块，取消批量初始化机制，仅对async require用到的模块进行初始化


1.8.4
-------

+ 环境安全优化：当前页面中已经存在其他loader的define和require时，不进行覆盖
+ 性能优化：define方法不通过arguments读取参数
+ 代码优化：对urlArgs的匹配逻辑进行了优化
+ 增加loader和版本信息标识
+ 增加自己的global require：esl

1.8.2
-------

优化模块加载过程：

+ 减少loader size
+ 修复1.8.0中菱形依赖和深层resource依赖的分支死角导致的加载终止

1.8.0
-------

+ 推迟模块的初始化时机，依赖模块的初始化从 *加载时* 推迟到 *使用时*
+ 增加 *noRequests* 配置参数，用于模块定义合并时排除多余模块的请求
+ 修复页面中加入无意义的匿名define时，下一个匿名定义的请求模块处理错误的问题


1.6.10
-------

+ 修复使用初始化完成的plugin加载多个resources时，只会加载第一个resource，无法完成当前模块初始化的bug


1.6.8
-------

+ 重新设计与实现了模块加载机制
+ 修复IE6下页面包含base标签时可能产生的bug

1.6.6
-------

+ 增加精简版。精简版删除了 *waitSeconds config的支持* 与 *global require调用时对relative id的检测和报错*。
+ 将模块分析与加载的顺序由逆序改为正序，以保证对加载顺序有依赖的resource正确加载与运行。


1.6.2
-------

+ 修复module id中包含.时路径查找错误问题
+ 梳理toUrl，修复global require的toUrl参数匹配package main时结果错误问题


1.6.0
-------

+ 增加urlArgs参数支持
+ 增加global require调用时对relative id的检测和报错
+ 增加define调用后尝试完成模块定义的机制
+ 修复1.4.2中引入的bug: global require对象不包含toUrl方法


1.4.2
-------

+ 增加waitSeconds config的支持，默认为0
+ 增强模块初始化对循环依赖的尝试机制


1.4.0
-------

+ 增加module config的支持
+ 修复合并模块中包含其依赖的plugin模块时，加载过程终止的问题


1.3.0
-------

+ 增加Loader Plugin的fromText支持
+ 给require(string)增加一层中间缓存，进行性能优化
+ require.config实现更改为二级结构mixin，允许多处配置与合并
+ 优化define的参数解析过程
+ 优化模块定义过程的状态管理
+ 增加factory invoke前对软依赖模块的检测
+ 修复relative2absolute不能向上查找到根的问题


1.2.0
-------

+ 修复paths配置使用绝对路径时模块加载路径错误问题
+ 修复require.toUrl时未指向正确的baseUrl问题


1.1.0
-------

+ 修复toUrl对非module id style的输入解析错误问题
+ 修复global下使用require加载resource多次时不缓存的问题
+ 增加JS Loader Plugin

