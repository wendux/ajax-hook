export function testRequest(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);

    xhr.onload = () => {
        console.log(`origin onload : ${xhr.response}`);
        xhr.response = 'xhr response has been reset';
    }

    xhr.onerror = () => {
        console.log(`${url}: xhr error`);
    }
    
    xhr.onreadystatechange = (...args) => {}
    xhr.setRequestHeader('header1', 'header1');
    xhr.send();
}


