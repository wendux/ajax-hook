/*
 * author: wendux
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 **/
module.exports = function (ob) {

    //Save original XMLHttpRequest as RealXMLHttpRequest
    var realXhr = "RealXMLHttpRequest"

    //Call this function will override the `XMLHttpRequest` object
    ob.hookAjax = function (proxy) {

        // Avoid double hook
        window[realXhr] = window[realXhr] || XMLHttpRequest

        XMLHttpRequest = function () {
            var xhr = new window[realXhr];
            // We shouldn't hook XMLHttpRequest.prototype because we can't
            // guarantee that all attributes are on the prototype。
            // Instead, hooking XMLHttpRequest instance can avoid this problem.
            for (var attr in xhr) {
                var type = "";
                try {
                    type = typeof xhr[attr] // May cause exception on some browser
                } catch (e) {
                }
                if (type === "function") {
                    // hook methods of xhr, such as `open`、`send` ...
                    this[attr] = hookFunction(attr);
                } else {
                    Object.defineProperty(this, attr, {
                        get: getterFactory(attr),
                        set: setterFactory(attr),
                        enumerable: true
                    })
                }
            }
            this.xhr = xhr;

        }

        // Generate getter for attributes of xhr
        function getterFactory(attr) {
            return function () {
                var v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
                var attrGetterHook = (proxy[attr] || {})["getter"]
                return attrGetterHook && attrGetterHook(v, this) || v
            }
        }

        // Generate setter for attributes of xhr; by this we have an opportunity
        // to hook event callbacks （eg: `onload`） of xhr;
        function setterFactory(attr) {
            return function (v) {
                var xhr = this.xhr;
                var that = this;
                var hook = proxy[attr];
                if (typeof hook === "function") {
                    // hook  event callbacks such as `onload`、`onreadystatechange`...
                    xhr[attr] = function () {
                        proxy[attr](that) || v.apply(xhr, arguments);
                    }
                } else {
                    //If the attribute isn't writable, generate proxy attribute
                    var attrSetterHook = (hook || {})["setter"];
                    v = attrSetterHook && attrSetterHook(v, that) || v
                    try {
                        xhr[attr] = v;
                    } catch (e) {
                        this[attr + "_"] = v;
                    }
                }
            }
        }

        // Hook methods of xhr.
        function hookFunction(fun) {
            return function () {
                var args = [].slice.call(arguments)
                if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
                    return;
                }
                return this.xhr[fun].apply(this.xhr, args);
            }
        }

        // Return the real XMLHttpRequest
        return window[realXhr];
    }

    // Cancel hook
    ob.unHookAjax = function () {
        if (window[realXhr]) XMLHttpRequest = window[realXhr];
        window[realXhr] = undefined;
    }

    //for typescript
    ob["default"] = ob;
}
