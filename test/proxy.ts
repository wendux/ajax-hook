import {proxy} from "../index"
import {testProxy} from './test'

proxy({
  onRequest: (config, handler) => {
    config.headers = { 'content-type': 'text/text', customHeader1: 'customHeader1', ...config.headers }
    if (config.url === 'https://aa/') {
      handler.resolve({
        config: config,
        status: 200,
        headers: config.headers,
        response: 'hi world'
      });
    } else {
      handler.next(config);
    }

  },
  onError: (err, handler) => {
    if (err.config.url === 'https://bb/') {
      handler.resolve({
        config: err.config,
        status: 200,
        headers: { 'content-type': 'text/text', customHeader1: 'customHeader1', ...err.config.headers },
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
}, window);


var { unProxy } = proxy({
  onRequest: (config, handler) => {
    config.headers = {
      ...config.headers,
      customHeader2: 'customHeader2'
    }
    handler.next(config);
  },
}, window);


// unProxy();

testProxy()




