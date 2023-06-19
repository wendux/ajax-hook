# Change list

## 3.0.0
API签名相对2.x发生了变化，故增加大版本号，更新列表：
- 支持多次拦截请求，修改取消拦截的方式，调用 `proxy` 或 `unHook` 时返回 `unProxy` 或 `unHook` 方法
- fix #103

## 2.1.2

- 添加可选参数[window]，可以指定iframe的window对象来拦截同源iframe页面内的ajax请求。


## 2.0.3

- 兼容IE fix #49 #52

## 2.0.2

- fix #47

## 2.0

- 添加了两个新API:  `proxy(...)` 、 `unProxy()` 

- 将 `hookAjax(...)` 重命名为 `hook(...)` , `unHookAjax(...)` 重命名为 `unHook(...)`

- 通过`hook()`拦截时，2.0中，XHR事件回调钩子函数（以"on"开头的），如`onreadystatechange`、`onload`等，他们的拦截函数的第一个参数都为"**原生xhr对象**" ，而1.x中为**代理xhr对象**。

- npm包支持es6 module；cdn方式引入后API会挂在名为“ah”的全局变量下；

- 支持 TypeScript

  

