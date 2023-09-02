import { hook } from "../index"
import { testRequest } from './test'

function testHook() {
    testRequest(location.href);
    // testRequest('https://aa');
}

const { unHook: unHook1, originXhr: originXhr1 } = hook({
    onreadystatechange: function (xhr) {
        console.log("1. onreadystatechange")
    },
    onload: function (xhr) {
        console.log("1. onload")
        // xhr.getProxy().responseText='xhr.responseText'
        this.responseText = "hookAjax" + xhr.responseText;
    },
    onerror: function (xhr) {
        console.log("1. onerror"); 
    },
    open: function (arg, xhr) {
        //add tag
        arg[1] += "&hook_tag=1";
        console.log("1. open");

    },
    send: function (arg, xhr) {
        console.log("1. send");
        xhr.setRequestHeader("_custom_header_1", "ajaxhook1");
    },
    setRequestHeader: function (args, xhr) {
        console.log("1. setRequestHeader");
    },
    response: {
        getter: () => {
            return { data: '1 res' }
        },
        setter(value, target) {
            console.log('1. set response');
            return '1. set response: set response value';
        },
    }
});

const { unHook: unHook2, originXhr: originXhr2 } = hook({
    onreadystatechange: function (xhr) {
        console.log("2. onreadystatechange")
    },
    onload: function (xhr) {
        console.log("2. onload")
        // xhr.getProxy().responseText='xhr.responseText'
        this.responseText = "hookAjax" + xhr.responseText;
    },
    onerror: function (xhr) {
        console.log("2. onerror");  
    },
    open: function (arg, xhr) {
        //add tag
        arg[1] += "?hook_tag=2";
        console.log("2. open");
    },
    send: function (arg, xhr) {
        console.log("2. send");
        xhr.setRequestHeader("_custom_header_2", "ajaxhook2");
    },
    setRequestHeader: function (args, xhr) {
        console.log("2. setRequestHeader")
    },
    response: {
        getter: () => {
            return { data: '2. res' }
        },
        setter(value, target) {
            console.log('2. set response');
            return '2. set response';
        },
    }
});

unHook1();

// unHook2();

testHook()



