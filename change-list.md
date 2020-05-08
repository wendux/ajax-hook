# Change list


## 2.0.3

- 兼容IE fix #49 #52

## 2.0.2

- fix #47

## 2.0

- 添加了两个新API:  `proxy(...)` 、 `unProxy()` 

- 将 `hookAjax(...)` 重命名为 `hook(...)` , `unHookAjax(...)` 重命名为 `unHook(...)`

- 通过`hook()`拦截时，2.0中，XHR事件回调钩子函数（以"on"开头的），如`onreadystatechange`、`onload`等，他们的拦截函数的第一个参数都为"**原生xhr对象**" ，而1.x中为**代理xhr对象**。

- npm包支持es6 module；cdn方式引入后API会挂在名为“ah”的全局变量下；

  

