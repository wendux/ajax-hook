/*
 * author: wendux
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 */

export var events = ['load', 'loadend', 'timeout', 'error', 'readystatechange', 'abort'];

var OriginXhr = '__origin_xhr';

export function configEvent(event, xhrProxy) {
  var e = {};
  for (var attr in event) e[attr] = event[attr];
  // xhrProxy instead
  e.target = e.currentTarget = xhrProxy
  return e;
}

export function hook(proxy, win) {
  win = win || window;
  var originXhr = win.XMLHttpRequest;

  win.XMLHttpRequest = function () {
    // We shouldn't hookAjax XMLHttpRequest.prototype because we can't
    // guarantee that all attributes are on the prototype。
    // Instead, hooking XMLHttpRequest instance can avoid this problem.

    var xhr = new originXhr();

    // Generate all callbacks(eg. onload) are enumerable (not undefined).
    for (var i = 0; i < events.length; ++i) {
      var key='on'+events[i];
      if (xhr[key] === undefined) xhr[key] = null;
    }

    for (var attr in xhr) {
      var type = "";
      try {
        type = typeof xhr[attr] // May cause exception on some browser
      } catch (e) {
      }
      if (type === "function") {
        // hookAjax methods of xhr, such as `open`、`send` ...
        this[attr] = hookFunction(attr);
      } else if (attr !== OriginXhr) {
        Object.defineProperty(this, attr, {
          get: getterFactory(attr),
          set: setterFactory(attr),
          enumerable: true
        }) 
      }
    }
    var that = this;
    xhr.getProxy = function () {
      return that
    }
    this[OriginXhr] = xhr;
  }

  Object.assign(win.XMLHttpRequest, {UNSENT: 0, OPENED: 1, HEADERS_RECEIVED: 2, LOADING: 3, DONE: 4});

  // Generate getter for attributes of xhr
  function getterFactory(attr) {
    return function () {
      var v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this[OriginXhr][attr];
      var attrGetterHook = (proxy[attr] || {})["getter"];
      return attrGetterHook && attrGetterHook(v, this) || v;
    }
  }

  // Generate setter for attributes of xhr; by this we have an opportunity
  // to hookAjax event callbacks （eg: `onload`） of xhr;
  function setterFactory(attr) {
    return function (v) {
      var xhr = this[OriginXhr];
      var that = this;
      var hook = proxy[attr];
      // hookAjax  event callbacks such as `onload`、`onreadystatechange`...
      if (attr.substring(0, 2) === 'on') {
        that[attr + "_"] = v;
        xhr[attr] = function (e) {
          e = configEvent(e, that)
          var ret = proxy[attr] && proxy[attr].call(that, xhr, e)
          ret || v.call(that, e);
        }
      } else {
        //If the attribute isn't writable, generate proxy attribute
        var attrSetterHook = (hook || {})["setter"];
        v = attrSetterHook && attrSetterHook(v, that) || v
        this[attr + "_"] = v;
        try {
          // Not all attributes of xhr are writable(setter may undefined).
          xhr[attr] = v;
        } catch (e) {
        }
      }
    }
  }

  // Hook methods of xhr.
  function hookFunction(fun) {
    return function () {
      var args = [].slice.call(arguments);
      if (proxy[fun]) {
        var ret = proxy[fun].call(this, args, this[OriginXhr])
        // If the proxy return value exists, return it directly,
        // otherwise call the function of xhr.
        if (ret) return ret;
      }
      return this[OriginXhr][fun].apply(this[OriginXhr], args);
    }
  }

  function unHook() {
      win.XMLHttpRequest = originXhr;
      originXhr = undefined;
  }

  // Return the real XMLHttpRequest and unHook func
  return { originXhr, unHook  };
}


