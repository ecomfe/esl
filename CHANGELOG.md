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

