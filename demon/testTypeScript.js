"use strict";
exports.__esModule = true;
var index_1 = require("../index");
index_1["default"].hookAjax({
    onreadystatechange: function (xhr) {
        console.log("onreadystatechange called: %O", xhr);
        //return true
    },
    onload: function (xhr) {
        console.log("onload called: %O", xhr);
        xhr.responseText = "hook" + xhr.responseText;
        //return true;
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
    setRequestHeader: function (arg, xhr) {
        console.log("setRequestHeader called!", arg);
    }
});
