/*
 * author: wendu
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 **/
module.exports=function (ob) {
    ob.hookAjax = function (proxy) {
        window._ahrealxhr = window._ahrealxhr || XMLHttpRequest
        XMLHttpRequest = function () {
            this.xhr = new window._ahrealxhr;
            for (var attr in this.xhr) {
                var type = "";
                try {
                    type = typeof this.xhr[attr]
                } catch (e) {}
                if (type === "function") {
                    this[attr] = hookfun(attr);
                } else {
                    Object.defineProperty(this, attr, {
                        get: getFactory(attr),
                        set: setFactory(attr)
                    })
                }
            }
        }

        function getFactory(attr) {
            return function () {
                var v= this.hasOwnProperty(attr + "_")?this[attr + "_"]:this.xhr[attr];
                var attrGetterHook=(proxy[attr]||{})["getter"]
                return attrGetterHook&&attrGetterHook(v,this)||v
            }
        }

        function setFactory(attr) {
            return function (v) {
                var xhr = this.xhr;
                var that = this;
                var hook=proxy[attr];
                if (typeof hook==="function") {
                    xhr[attr] = function () {
                        proxy[attr](that) || v.apply(xhr, arguments);
                    }
                } else {
                    //If the attribute isn't writeable, generate proxy attribute
                    var attrSetterHook=(hook||{})["setter"];
                    v=attrSetterHook&&attrSetterHook(v,that)||v
                    try {
                        xhr[attr] = v;
                    }catch(e) {
                        this[attr + "_"] = v;
                    }
                }
            }
        }

        function hookfun(fun) {
            return function () {
                var args = [].slice.call(arguments)
                if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
                    return;
                }
                return this.xhr[fun].apply(this.xhr, args);
            }
        }
        return window._ahrealxhr;
    }
    ob.unHookAjax = function () {
        if (window._ahrealxhr)  XMLHttpRequest = window._ahrealxhr;
        window._ahrealxhr = undefined;
    }
    //for typescript
    ob["default"]=ob;
}
