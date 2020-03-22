import {proxy} from "../index";
import {testProxy} from './test'

proxy({
    onRequest: (config, handler) => {
        if (config.url === 'https://aa/') {
            handler.resolve({
                config: config,
                status: 200,
                headers: {'content-type': 'text/text'},
                response: 'hi world'

            })
        } else {
            handler.next(config);
        }
    },
    onError: (err, handler) => {
        if (err.config.url === 'https://bb/') {
            handler.resolve({
                config: err.config,
                status: 200,
                headers: {'content-type': 'text/text'},
                response: 'hi world'
            })
        } else {
            handler.next(err)
        }
    },
    onResponse: (response, handler) => {
        if (response.config.url === location.href) {
            handler.reject({
                config: response.config,
                type: 'error'
            })
        } else {
            handler.next(response)
        }
    }
})

testProxy()

proxy({
    onRequest: (config, handler) => {
        console.log(config.url)
        handler.next(config);

    },
    onError: (err, handler) => {
        console.log(err.type)
        handler.next(err)
    },
    onResponse: (response, handler) => {
        console.log(response.response)
        handler.next(response)
    }
})

