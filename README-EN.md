# Ajax-hook

[![npm version](https://img.shields.io/npm/v/ajax-hook.svg)](https://www.npmjs.org/package/ajax-hook) [![build status](https://travis-ci.org/wendux/Ajax-hook.svg?branch=master)](https://travis-ci.org/wendux/Ajax-hook) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/mit-license.php) ![](https://img.shields.io/badge/typeScript-support-orange.svg)  ![](https://img.shields.io/badge/support-%3E%3Des5-orange.svg) [![](https://img.shields.io/github/size/wendux/Ajax-hook/dist/ajaxhook.min.js.svg)](https://unpkg.com/ajax-hook@1.8.0/dist/ajaxhook.min.js)



![image](https://github.com/wendux/Ajax-hook/raw/master/ajaxhook.png)

中文文档:[http://www.jianshu.com/p/9b634f1c9615](http://www.jianshu.com/p/9b634f1c9615)

原理解析:[http://www.jianshu.com/p/7337ac624b8e](http://www.jianshu.com/p/7337ac624b8e)

## Introduction

Hooking  Javascript  XMLHttpRequest ，It can intercept Ajax requests and responses by underlying proxy.

## Usage

1. Installing

   - Using cdn 

     ```html
     <script src="https://unpkg.com/ajax-hook/dist/ajaxhook.min.js"></script>
     ```

   - Using npm

     ```shell
     npm install ajax-hook
     ```

2. hook the callbacks and functions you want .

   ```javascript
   hookAjax({
     //hook callbacks
     onreadystatechange:function(xhr){
       console.log("onreadystatechange called: %O",xhr)
     },
     onload:function(xhr){
       console.log("onload called: %O",xhr)
     },
     //hook function
     open:function(arg,xhr){
       console.log("open called: method:%s,url:%s,async:%s",arg[0],arg[1],arg[2])
     }
   })

   // NPM
   // const ah=require("ajax-hook")
   // ah.hookAjax({...})
   ```

Now, it worked! we use jQuery ajax  to test .

```javascript
// get current page source code 
$.get().done(function(d){
    console.log(d.substr(0,30)+"...")
})
```

The result :

```
> open called: method:GET,url:http://localhost:63342/Ajax-hook/demo.html,async:true
> onload called: XMLHttpRequest
> <!DOCTYPE html>
  <html>
  <head l...
```

**See the demo "demo.html" for more details.**

## API

### hookAjax(ob)

- ob; type is Object
- return value: original XMLHttpRequest

### unHookAjax()

- unhook Ajax 

## Changing the default Ajax behavior

The return value type of all hook-functions is boolean, if `true`, the ajax request  will be interrupted ,`false` or `undefined` will continue .  for example:

```javascript

hookAjax({
  open:function(arg,xhr){
    if(arg[0]=="GET"){
      console.log("Request was aborted! method must be post! ")
      return true;
    }
  } 
 })
```

Changing the "responseText"

```javascript
hookAjax({
   onload:function(xhr){
    console.log("onload called: %O",xhr)
    xhr.responseText="hook!"+xhr.responseText;
   }
 })
```

Result:

```
hook!<!DOCTYPE html>
<html>
<h...
```



## Notice

All callbacks such as onreadystatechange、onload and son on, the first argument is current XMLHttpRequest instance. All functions, such as open, send and so on, the first parameter is an array of the original parameters, the second parameter is the current origin XMLHttpRequest instance.
