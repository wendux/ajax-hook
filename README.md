# Ajax-hook

[![npm version](https://img.shields.io/npm/v/ajax-hook.svg)](https://www.npmjs.org/package/ajax-hook) [![build status](https://travis-ci.org/wendux/Ajax-hook.svg?branch=master)](https://travis-ci.org/wendux/Ajax-hook) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/mit-license.php) ![](https://img.shields.io/badge/TypeScript-support-orange.svg)   [![](https://img.shields.io/github/size/wendux/Ajax-hook/dist/ajaxhook.core.min.js.svg)](https://unpkg.com/ajax-hook@2.0.0/dist/ajaxhook.core.min.js)




![image](https://github.com/wendux/Ajax-hook/raw/master/ajaxhook.png)

原理解析:[http://www.jianshu.com/p/7337ac624b8e](http://www.jianshu.com/p/7337ac624b8e)

## 简介

Ajax-hook是一个精巧的用于拦截浏览器XMLHttpRequest的库，它可以在XMLHttpRequest对象发起请求之前和收到响应内容之后获得处理权。通过它你可以在底层对请求和响应进行一些预处理。

## 更新记录

2.0版本已发布，2.0和1.x最大的区别是添加了`proxy`方法，这是详细的[change list](./change-list.md) 。

## 使用

### 安装

- CDN引入

  ```html
  <script src="https://unpkg.com/ajax-hook@2.0.3/dist/ajaxhook.min.js"></script>
  ```

  引入后会有一个名为"ah"（ajax hook）的全局对象，通过它可以调用ajax-hook的API，如`ah.proxy(hooks)`

- NPM引入

  ```shell
  npm install ajax-hook
  ```

### 拦截`XMLHttpRequest`

通过`proxy(hooks)`拦截：

```javascript
import {proxy, unProxy} from "ajax-hook";
proxy({
    //请求发起前进入
    onRequest: (config, handler) => {
        console.log(config.url)
        handler.next(config);
    },
    //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
    onError: (err, handler) => {
        console.log(err.type)
        handler.next(err)
    },
    //请求成功后进入
    onResponse: (response, handler) => {
        console.log(response.response)
        handler.next(response)
    }
})
```

现在，我们便拦截了浏览器中通过`XMLHttpRequest`发起的所有网络请求！在请求发起前，会先进入`onRequest`钩子，调用`handler.next(config)` 请求继续，如果请求成功，则会进入`onResponse`钩子，如果请求发生错误，则会进入`onError` 。我们可以更改回调钩子的第一个参数来修改修改数据。

### Handler

在钩子函数我们可以通过handler来决定请求的后续流程，它有3个方法：

1. `next(arg)`：继续进入后续流程；如果不调用，则请求链便会暂停，这种机制可以支持在钩子中执行一些异步任务。该方法在`onResponse`钩子中等价于`resolve`，在`onError`钩子中等价于`reject`
2. `resolve(response)`：调用后，请求后续流程会被阻断，直接返回响应数据，上层`xhr.onreadystatechange`或`xhr.onload`会被调用。
3. `reject(err)`：调用后，请求后续流程会被阻断，直接返回错误，上层的`xhr.onerror`、`xhr.ontimeout`、`xhr.onabort`之一会被调用，具体调用哪个取决于`err.type`的值，比如我们设置`err.type`为"timeout"，则`xhr.ontimeout`会被调用。

> 关于`config`、`response`、`err`的结构定义请参考[类型定义文件](./index.d.ts)中的`XhrRequestConfig`、`XhrResponse`、`XhrError`

### 示例

```javascript
proxy({
    onRequest: (config, handler) => {
        if (config.url === 'https://aa/') {
            handler.resolve({
                config: config,
                status: 200,
                headers: {'content-type': 'text/text'},
                response: 'hi world'
            })
        } else {
            handler.next(config);
        }
    },
    onError: (err, handler) => {
        if (err.config.url === 'https://bb/') {
            handler.resolve({
                config: err.config,
                status: 200,
                headers: {'content-type': 'text/text'},
                response: 'hi world'
            })
        } else {
            handler.next(err)
        }
    },
    onResponse: (response, handler) => {
        if (response.config.url === location.href) {
            handler.reject({
                config: response.config,
                type: 'error'
            })
        } else {
            handler.next(response)
        }
    }
})

// 使用jQuery发起网络请求
function testJquery(url) {
    $.get(url).done(function (d) {
        console.log(d)
    }).fail(function (e) {
        console.log('hi world')
    })
}

//测试
testJquery('https://aa/');
testJquery('https://bb/');
testJquery(location.href)
```

运行后，控制台输出3次 "hi world"。





## 核心API-`hook(hooks)`

Ajax-hook在1.x版本中只提供了一个核心拦截功能的库，在1.x中，我们通过`hookAjax()` 方法（2.x中改名为`hook()`）实现了对`XMLHttpRequest`对象具体属性、方法、回调的细粒度拦截，而2.x中的`proxy()`方法则是基于`hook`的一个封装，下面我们看一下如何使用`hook`方法来拦截`XMLHttpRequest`对象：

```javascript
import {hook} from "ajax-hook"
hook({
  //拦截回调
  onreadystatechange:function(xhr,event){
    console.log("onreadystatechange called: %O")
    //返回false表示不阻断，拦截函数执行完后会接着执行真正的xhr.onreadystatechange回调.
    //返回true则表示阻断，拦截函数执行完后将不会执行xhr.onreadystatechange. 
    return false
  },
  onload:function(xhr,event){
    console.log("onload called")
    return false
  },
  //拦截方法
  open:function(args,xhr){
    console.log("open called: method:%s,url:%s,async:%s",arg[0],arg[1],arg[2])
    //拦截方法的返回值含义同拦截回调的返回值
    return false
  }
})
```

这样拦截就生效了，拦截的全局的`XMLHttpRequest`，所以，无论你使用的是哪种JavaScript http请求库，它们只要最终是使用`XMLHttpRequest`发起的网络请求，那么拦截都会生效。下面我们用jQuery发起一个请求：

```javascript
// 获取当前页面的源码(Chrome中测试)
$.get().done(function(d){
    console.log(d.substr(0,30)+"...")
})
```

输出:

```
> open called: method:GET,url:http://localhost:63342/Ajax-hook/demo.html,async:true
> onload called
> <!DOCTYPE html>
  <html>
  <head l...
```

可以看到我们的拦截已经成功。通过日志我们可以发现，在请求成功时，jQuery是回调的`onload（）`，而不是`onreadystatechange()`，由于这两个回调都会在返回响应结果时被调用，所以为了保险起见，如果你要拦截网络请求的结果，建议同时拦截`onload()`和`onreadystatechange()`，除非你清楚的知道上层库使用的具体回调。

### 拦截`XMLHttpRequest`的属性

除了拦截`XMLHttpRequest`回调和方法外，也可以拦截属性的**读/写**操作。比如设置超时`timeout`，读取响应内容`responseText`等。下面我们通过两个示例说明。

- 假设为了避免用户设置不合理的超时时间，如，小于30ms，那么这将导致超过30ms的网络请求都将触发超时，因此，我们在底层做一个判断，确保超时时间最小为1s：

  ```javascript
  hook(
      //需要拦截的属性名
      timeout: {
          //拦截写操作
          setter: function (v, xhr) {
              //超时最短为1s，返回值为最终值。
              return Math.max(v, 1000);
          }
      }
  )
  ```

- 假设在请求成功后，但在返回给用户之前，如果发现响应内容是JSON文本，那么我们想自动将JSON文本转为对象，要实现这个功能，有两种方方法：

  - 拦截成功回调

    ```javascript

    function tryParseJson1(xhr){
        var contentType=xhr.getResponseHeader("content-type")||"";
        if(contentType.toLocaleLowerCase().indexOf("json")!==-1){
            xhr.responseText=JSON.parse(xhr.responseText);
        }
    }

    hookAjax({
      //拦截回调
      onreadystatechange:tryParseJson1,
      onload:tryParseJson1
    });
    ```



  - 拦截`responseText` 和 `response`读操作

    ```javascript
    function tryParseJson2(v,xhr){
        var contentType=xhr.getResponseHeader("content-type")||"";
        if(contentType.toLocaleLowerCase().indexOf("json")!==-1){
            v=JSON.parse(v);
            //不能在属性的getter钩子中再读取该属性，这会导致循环调用
            //v=JSON.parse(xhr.responseText);
        }
        return v;
    }

    //因为无法确定上层使用的是responseText还是response属性，为了保险起见，两个属性都拦截一下
    hook(
        responseText: {
            getter: tryParseJson2
        },
        response: {
            getter:tryParseJson2
        }
    )
    ```



### ajax-hook.core.js

如果你只想使用`hook()`方法（不需要使用`proxy()`），我们提供了只包含`hook()`方法的核心库，你可以在[dist目录](https://github.com/wendux/Ajax-hook/tree/master/dist)找到名为`ajax-hook.core.js`的文件，直接使用它即可。

## `proxy()` vs `hook()`

`proxy()` 和`hook()`都可以用于拦截全局`XMLHttpRequest`。它们的区别是：`hook()`的拦截粒度细，可以具体到`XMLHttpRequest`对象的某一方法、属性、回调，但是使用起来比较麻烦，很多时候，不仅业务逻辑需要散落在各个回调当中，而且还容易出错。而`proxy()`抽象度高，并且构建了请求上下文（请求信息config在各个回调中都可以直接获取），使用起来更简单、高效。

大多数情况下，我们建议使用`proxy()` 方法，除非`proxy()` 方法不能满足你的需求。



## API

#### `proxy(proxyObject)`

拦截全局`XMLHttpRequest`。

参数：`proxyObject`是一个对象，包含三个可选的钩子`onRequest`、`onResponse`、`onError`，我们可以直接在这三个钩子中对请求进行预处理。

返回值：浏览器原生的`XMLHttpRequest`

#### `unProxy()`

- 取消拦截；取消后`XMLHttpRequest`将不会再被代理，浏览器原生`XMLHttpRequest`会恢复到全局变量空间。

#### `hook(Hooks)`

拦截全局`XMLHttpRequest`，此方法调用后，浏览器原生的`XMLHttpRequest`将会被代理，代理对象会覆盖浏览器原生`XMLHttpRequest`，直到调用`unHook()`后才会取消代理。

- `hooks`; 钩子对象，里面是XMLHttpRequest对象的回调、方法、属性的钩子函数，钩子函数会在执行`XMLHttpRequest`对象真正的回调、方法、属性访问器前执行。
- 返回值: 浏览器原生的`XMLHttpRequest`.

#### `unHook()`

- 取消拦截；取消后`XMLHttpRequest`将不会再被代理，浏览器原生`XMLHttpRequest`会恢复到全局变量空间。



## 代理xhr对象和原生xhr对象

“**原生xhr对象**”即浏览器提供的XMLHttpRequest对象实例，而“**代理xhr对象**”指代理了“原生xhr对象”的对象，用户请求都是通过“代理xhr对象”发出，而“代理xhr对象”中又会调用“原生xhr对象”发起真正的网络请求。那么如何获取“代理xhr对象”和“原生xhr对象”呢？

1. XHR事件回调钩子函数（以"on"开头的），如`onreadystatechange`、`onload`等，他们的拦截函数的第一个参数都为"**原生xhr对象**" (**注意：这个和1.x版本有区别，1.x中为代理xhr对象**)。
2. XHR方法钩子函数（如`open`、`send`等），它们的第二个参数为**原生xhr对象**。
3. 所有回调函数钩子、方法钩子中，`this`为**代理xhr对象**
4. 原生xhr对象和代理对象都有获取彼此的方法和属性，具体见下面示例

```javascript
hook({
  // 参数xhr为原生xhr对象
  onload:function(xhr, event){
    // this 为代理xhr对象
    // 原生xhr对象扩展了一个`getProxy()`方法，调用它可以获取代理xhr对象
    this==xhr.getProxy() //true
    //可以通过代理xhr对象的`xhr`属性获取原生xhr对象
    this.xhr==xhr //true
    console.log("onload called")
    return false
  },
})
```

## 注意

- `XMLHttpRequest`所有回调函数(以"on"开头的，如`onreadystatechange`、`onload`等)，他们的拦截函数的第一个参数都为当前的`XMLHttpRequest`对象**的代理对象**，所以，你可以通过它来进行请求上下文管理。

  > 假设对于同一个请求，你需要在其`open`的拦截函数和`onload` 回调中共享一个变量，但由于拦截的是全局XMLHttpRequest对象，所有网络请求会无次序的走到拦截的方法中，这时你可以通过`xhr`来对应请求的上下文信息。在上述场景中，你可以在`open`拦截函数中给`xhr`设置一个属性，然后在`onload`回调中获取即可。

- `XMLHttpRequest`的所有方法如`open`、`send等`，他们拦截函数的第一个参数是一个数组，数组的内容是其对应的原生方法的参数列表，第二个参数是本次请求对应的`XMLHttpRequest`对象（已代理）。返回值类型是一个布尔值，为true时会阻断对应的请求。

- 对于属性拦截器，为了避免循环调用导致的栈溢出，不可以在其getter拦截器中再读取其同名属性或在其setter拦截器中在给其同名属性赋值。

- 本库需要在支持ES5的浏览器环境中运行(不支持IE8)，但本库并不依赖ES6新特性。

## 最后

本库在2016年首次开源，最初只是个人研究所用，源码50行左右，实现了一个Ajax拦截的核心，并非一个完整可商用的项目。自开源后，有好多人对这个黑科技比较感兴趣，于是我便写了篇介绍的博客，由于代码比较精炼，所以对于JavaScript不是很精通的同学可能看起来比较吃力，之后专门写了一篇原理解析的文章，现在已经有很多公司已经将ajax-hook用于线上项目中，直到我知道美团、滴滴也用到之后，笔者对此库进行了修改和扩展以增强其健壮性和实用性，现在已经达到商用的标准，本库也将进行技术支持。如果你喜欢，欢迎Star，如果有问题，欢迎提Issue， 如果你想打赏或想请作者喝杯咖啡，请扫描下面二维码：



![image-20180827191240122](https://pcdn.flutterchina.club/imgs/pay.jpeg)
