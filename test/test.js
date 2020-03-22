import {unHook} from "../index";

function testJquery(url) {
    window['jQuery'].get(url).done(function (d) {
        console.log(d)
    }).fail(function (e) {
        console.log('hi world')
    })
}

export function testProxy() {
    testJquery('https://aa/');
    testJquery('https://bb/');
    testJquery(location.href)
}

export function testHook() {
    $.get().done(function (d) {
        console.log(d.substr(0, 30) + "...")
        //use original XMLHttpRequest
        console.log("unhook")
        unHook()
        $.get().done(function (d) {
            console.log(d.substr(0, 10))
        })

    })
}
