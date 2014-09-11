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
+ 增加 *noRequests*配置参数，用于模块定义合并时排除多余模块的请求
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

