ESL的每个版本，都会将压缩后的资源通过CDN发布，便于开发者直接引用。


从 **1.6.6** 版本开始，发布的CDN资源将包括3个版本：

1. `normal`: 普通版。通过完整esl源码经过uglifyjs2压缩后发布，通常用于线上环境。
2. `min`: 精简版。删除了 *waitSeconds config的支持* 与 *global require调用时对relative id的检测和报错*，通常用于对体积要求吹毛求疵的线上环境。
3. `source`: 源码版。完整的esl源码，可用于开发过程调试。

### 1.8.8

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-8/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-8/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-8/esl.source.js"></script>


### 1.8.6

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-6/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-6/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-6/esl.source.js"></script>


### 1.8.4

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-4/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-4/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-4/esl.source.js"></script>


### 1.8.2

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-2/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-2/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-2/esl.source.js"></script>
```

### 1.8.0

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-0/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-0/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-8-0/esl.source.js"></script>
```

### 1.6.10

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-10/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-10/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-10/esl.source.js"></script>
```

### 1.6.8

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-8/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-8/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-8/esl.source.js"></script>
```

### 1.6.6

```html
<!-- normal -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-6/esl.js"></script>

<!-- min -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-6/esl.min.js"></script>

<!-- source -->
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-6/esl.source.js"></script>
```


### 1.6.2

```html
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-2/esl.js"></script>
```


### 1.6.0

```html
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-6-0/esl.js"></script>
```


### 1.4.2

```html
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-4-2/esl.js"></script>
```


### 1.4.0

```html
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-4-0/esl.js"></script>
```


### 1.3.0

```html
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-3-0/esl.js"></script>
```


### 1.2.0

```html
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/1-2-0/esl.js"></script>
```


