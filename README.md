中文简体|[English](./README-EN.md)

# Ajax-hook

[![npm version](https://img.shields.io/npm/v/ajax-hook.svg)](https://www.npmjs.org/package/ajax-hook) [![build status](https://travis-ci.org/wendux/Ajax-hook.svg?branch=master)](https://travis-ci.org/wendux/Ajax-hook) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/mit-license.php) ![](https://img.shields.io/badge/typeScript-support-orange.svg)  ![](https://img.shields.io/badge/support-%3E%3Des5-orange.svg) [![](https://img.shields.io/github/size/wendux/Ajax-hook/dist/ajaxhook.min.js.svg)](https://unpkg.com/ajax-hook@1.8.0/dist/ajaxhook.min.js)



![image](https://github.com/wendux/Ajax-hook/raw/master/ajaxhook.png)

原理解析:[http://www.jianshu.com/p/7337ac624b8e](http://www.jianshu.com/p/7337ac624b8e)

## 简介

Ajax-hook是一个精巧的用于拦截XMLHttpRequest全局对象的库，它可以在XMLHttpRequest对象发起请求之前和收到响应内容之后获得处理权。通过它你可以在底层对请求进行统一的操作。

## 使用

### 安装

- CDN引入

  ```html
  <script src="https://unpkg.com/ajax-hook/dist/ajaxhook.min.js"></script>
  ```

- NPM引入

  ```shell
  npm install ajax-hook
  ```

### 拦截`XMLHttpRequest`回调和方法

```javascript
hookAjax({
  //拦截回调
  onreadystatechange:function(xhr){
    console.log("onreadystatechange called: %O",xhr)
  },
  onload:function(xhr){
    console.log("onload called: %O",xhr)
  },
  //拦截方法
  open:function(arg,xhr){
    console.log("open called: method:%s,url:%s,async:%s",arg[0],arg[1],arg[2])
  }
})

// NPM
// const ah=require("ajax-hook")
// ah.hookAjax({...})
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
> onload called: XMLHttpRequest
> <!DOCTYPE html>
  <html>
  <head l...
```

可以看到我们的拦截已经成功。通过日志我们可以发现，在请求成功时，jQuery是回调的`onload（）`，而不是`onreadystatechange()`，由于这两个回调都会在返回响应结果时被调用，所以为了保险起见，如果你要拦截网络请求的结果，建议同时拦截`onload()`和`onreadystatechange()`，除非你清楚的知道上层库使用的具体回调。

### 拦截`XMLHttpRequest`的属性

除了拦截`XMLHttpRequest`回调和方法外，也可以拦截属性的**读/写**操作。比如设置超时`timeout`，读取响应内容`responseText`等。下面我们通过两个示例说明。

- 假设为了避免用户设置不合理的超时时间，如，小于30ms，那么这将导致超过30ms的网络请求都将触发超时，因此，我们在底层做一个判断，确保超时时间最小为1s：

  ```javascript
  hookAjax(
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

    //因为无法确定上层使用的是responseText还是respons属性，为了保险起见，两个属性都拦截一下
    hookAjax(
        responseText: {
            getter: tryParseJson2
        },
        response: {
            getter:tryParseJson2
        }
    )
    ```





## API

### hookAjax(proxy)

拦截全局`XMLHttpRequest`，此方法调用后，浏览器原生的`XMLHttpRequest`将会被代理，直到调用`unHookAjax()`后才会取消代理。

- `proxy`; 需要代理的对象
- 返回值: 浏览器真正的`XMLHttpRequest`.

### unHookAjax()

- 取消拦截；取消后`XMLHttpRequest`将不会再被代理



## 注意

- `XMLHttpRequest`所有回调函数，如`onreadystatechange`、`onload`等，他们的拦截函数的第一个参数都为当前的`XMLHttpRequest`对象，一次请求对应一个`XMLHttpRequest`对象（已代理），所以，你可以通过它来进行请求上下文管理。

  > 假设对于同一个请求，你需要在其`open`的拦截函数和`onload` 回调中共享一个变量，但由于拦截的是全局XMLHttpRequest对象，所有网络请求会无次序的走到拦截的方法中，这时你可以通过`xhr`来对应请求的上下文信息。在上述场景中，你可以在`open`拦截函数中给`xhr`设置一个属性，然后在`onload`回调中获取即可。

- `XMLHttpRequest`的所有方法如`open`、`send等`，他们拦截函数的第一个参数是一个数组，数组的内容是其对应的原生方法的参数列表，第二个参数是本次请求对应的`XMLHttpRequest`对象（已代理）。返回值类型是一个布尔值，为true时会阻断对应的请求。

- 对于属性拦截器，为了避免循环调用导致的栈溢出，不可以在其getter拦截器中再读取其同名属性或在其setter拦截器中在给其同名属性赋值。

- 本库需要在支持ES5的浏览器环境中运行(不支持IE8)，但本库并不依赖ES6新特性。

## 最后

本库在2016年首次开源，最初只是个人研究所用，源码50行左右，实现了一个Ajax拦截的核心，并非一个完整可商用的项目。自开源后，有好多人对这个黑科技比较感兴趣，于是我便写了篇介绍的博客，由于代码比较精炼，所以对于JavaScript不是很精通的同学可能看起来比较吃力，之后专门写了一篇原理解析的文章，现在已经有很多公司已经将ajax-hook用于线上项目中，直到我知道美团、滴滴也用到之后，笔者对此库进行了修改和扩展以增强其健壮性和实用性，现在已经达到商用的标准，本库也将进行技术支持。如果你喜欢，欢迎Star，如果有问题，欢迎提Issue， 如果你想打赏或想请作者喝杯咖啡，请扫描下面二维码：





![image-20180827191240122](https://github.com/wendux/Ajax-hook/raw/master/pay.png)
