function testJquery(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.send();
    xhr.onload = () => {
        if (xhr.status === 200) {
            console.log(xhr);
        }
    }
    xhr.onerror = () => {
        console.log(xhr.response);
    }
}

export function testHook() {
    testJquery('https://aa/');
}

export function testProxy() {
    testJquery('https://aa/');
    testJquery('https://bb/');
    testJquery(location.href)
}


