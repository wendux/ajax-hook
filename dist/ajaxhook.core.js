(function(e, a) { for(var i in a) e[i] = a[i]; }(window, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.configEvent = configEvent;
exports.hook = hook;
exports.unHook = unHook;
/*
 * author: wendux
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 */

// Save original XMLHttpRequest as _rxhr
var realXhr = "__xhr";

var events = exports.events = ['load', 'loadend', 'timeout', 'error', 'readystatechange', 'abort'];

function configEvent(event, xhrProxy) {
  var e = {};
  for (var attr in event) {
    e[attr] = event[attr];
  } // xhrProxy instead
  e.target = e.currentTarget = xhrProxy;
  return e;
}

function hook(proxy, win) {
  win = win || window;
  // Avoid double hookAjax
  win[realXhr] = win[realXhr] || win.XMLHttpRequest;

  win.XMLHttpRequest = function () {

    // We shouldn't hookAjax XMLHttpRequest.prototype because we can't
    // guarantee that all attributes are on the prototype。
    // Instead, hooking XMLHttpRequest instance can avoid this problem.

    var xhr = new win[realXhr]();

    // Generate all callbacks(eg. onload) are enumerable (not undefined).
    for (var i = 0; i < events.length; ++i) {
      var key = 'on' + events[i];
      if (xhr[key] === undefined) xhr[key] = null;
    }

    for (var attr in xhr) {
      var type = "";
      try {
        type = _typeof(xhr[attr]); // May cause exception on some browser
      } catch (e) {}
      if (type === "function") {
        // hookAjax methods of xhr, such as `open`、`send` ...
        this[attr] = hookFunction(attr);
      } else {
        Object.defineProperty(this, attr, {
          get: getterFactory(attr),
          set: setterFactory(attr),
          enumerable: true
        });
      }
    }
    var that = this;
    xhr.getProxy = function () {
      return that;
    };
    this.xhr = xhr;
  };

  Object.assign(win.XMLHttpRequest, { UNSENT: 0, OPENED: 1, HEADERS_RECEIVED: 2, LOADING: 3, DONE: 4 });

  // Generate getter for attributes of xhr
  function getterFactory(attr) {
    return function () {
      var v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
      var attrGetterHook = (proxy[attr] || {})["getter"];
      return attrGetterHook && attrGetterHook(v, this) || v;
    };
  }

  // Generate setter for attributes of xhr; by this we have an opportunity
  // to hookAjax event callbacks （eg: `onload`） of xhr;
  function setterFactory(attr) {
    return function (v) {
      var xhr = this.xhr;
      var that = this;
      var hook = proxy[attr];
      // hookAjax  event callbacks such as `onload`、`onreadystatechange`...
      if (attr.substring(0, 2) === 'on') {
        that[attr + "_"] = v;
        xhr[attr] = function (e) {
          e = configEvent(e, that);
          var ret = proxy[attr] && proxy[attr].call(that, xhr, e);
          ret || v.call(that, e);
        };
      } else {
        //If the attribute isn't writable, generate proxy attribute
        var attrSetterHook = (hook || {})["setter"];
        v = attrSetterHook && attrSetterHook(v, that) || v;
        this[attr + "_"] = v;
        try {
          // Not all attributes of xhr are writable(setter may undefined).
          xhr[attr] = v;
        } catch (e) {}
      }
    };
  }

  // Hook methods of xhr.
  function hookFunction(fun) {
    return function () {
      var args = [].slice.call(arguments);
      if (proxy[fun]) {
        var ret = proxy[fun].call(this, args, this.xhr);
        // If the proxy return value exists, return it directly,
        // otherwise call the function of xhr.
        if (ret) return ret;
      }
      return this.xhr[fun].apply(this.xhr, args);
    };
  }

  // Return the real XMLHttpRequest
  return win[realXhr];
}

function unHook(win) {
  win = win || window;
  if (win[realXhr]) win.XMLHttpRequest = win[realXhr];
  win[realXhr] = undefined;
}

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ah = undefined;

var _xhrHook = __webpack_require__(0);

var ah = exports.ah = {
  hook: _xhrHook.hook,
  unHook: _xhrHook.unHook
}; /*
    * author: wendux
    * email: 824783146@qq.com
    * source code: https://github.com/wendux/Ajax-hook
    */

/***/ })
/******/ ])));