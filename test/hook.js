"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var test_1 = require("./test");
index_1.hook({
    onreadystatechange: function (xhr) {
        console.log("onreadystatechange called: %O", xhr);
    },
    onload: function (xhr) {
        console.log("onload called: %O", xhr);
        // xhr.getProxy().responseText='xhr.responseText'
        this.responseText = "hookAjax" + xhr.responseText;
    },
    open: function (arg, xhr) {
        console.log("open called: method:%s,url:%s,async:%s", arg[0], arg[1], arg[2], xhr);
        //add tag
        arg[1] += "?hook_tag=1";
    },
    send: function (arg, xhr) {
        console.log("send called: %O", arg[0]);
        xhr.setRequestHeader("_custom_header_", "ajaxhook");
    },
    setRequestHeader: function (args, xhr) {
        console.log("setRequestHeader called!", args);
    }
});
test_1.testHook();
