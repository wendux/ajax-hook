import {hook} from "../index"
import {testHook} from './test'

hook({
    onreadystatechange: function (xhr) {
        console.log("first onreadystatechange called: %O", xhr)
    },
    onload: function (xhr) {
        console.log("first onload called: %O", xhr)
        // xhr.getProxy().responseText='xhr.responseText'
        this.responseText = "hookAjax" + xhr.responseText;
    },
    open: function (arg, xhr) {
        console.log("first open called: method:%s,url:%s,async:%s", arg[0], arg[1], arg[2], xhr)
        //add tag
        arg[1] += "&hook_tag=1";

    },
    send: function (arg, xhr) {
        console.log("first send called: %O", arg[0])
        xhr.setRequestHeader("_custom_header_1", "ajaxhook1")
    },
    setRequestHeader: function (args, xhr) {
        console.log("first setRequestHeader called!", args)
    },
    response: {
        getter: () => {
            return { data: 'first res' }
        }
    }
})

hook({
    onreadystatechange: function (xhr) {
        console.log("second onreadystatechange called: %O", xhr)
    },
    onload: function (xhr) {
        console.log("second onload called: %O", xhr)
        // xhr.getProxy().responseText='xhr.responseText'
        this.responseText = "hookAjax" + xhr.responseText;
    },
    open: function (arg, xhr) {
        console.log("second open called: method:%s,url:%s,async:%s", arg[0], arg[1], arg[2], xhr)
        //add tag
        arg[1] += "?hook_tag=2";

    },
    send: function (arg, xhr) {
        console.log("second send called: %O", arg[0])
        xhr.setRequestHeader("_custom_header_2", "ajaxhook2")
    },
    setRequestHeader: function (args, xhr) {
        console.log("second setRequestHeader called!", args)
    },
    response: {
        getter: () => {
            return { data: 'second res' }
        }
    }
})

testHook()

