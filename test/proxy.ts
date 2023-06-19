import { proxy } from "../index"
import { testRequest } from './test'


export function testProxy() {
  testRequest('https://cc/');
}

const { unProxy: unProxy1, originXhr: originXhr1 } = proxy({
  onRequest: (config, handler) => {
    console.log(`1. onRequest: ${config.url}`);
    config.headers = { 'content-type': 'text/text', customHeader1: 'customHeader1', ...config.headers };
    handler.next(config);

  },
  onError: (err, handler) => {
    console.log(`1. onError: ${err.config.url}`);
    handler.next(err);
  },
  onResponse: (response, handler) => {
    console.log(`1. onResponse: ${response.config.url}`);
    handler.next(response);
  }
}, window);


// const { unProxy: unProxy2, originXhr: originXhr2 } = proxy({
//   onRequest: (config, handler) => {
//     console.log(`2. onRequest: ${config.url}`);
//     config.headers = { 'content-type': 'text/text', customHeader2: 'customHeader2', ...config.headers };
//     handler.next(config);

//   },
//   onError: (err, handler) => {
//     console.log(`2. onError: ${err.config.url}`);
//     handler.next(err);
//   },
//   onResponse: (response, handler) => {
//     console.log(`2. onResponse: ${response.config.url}`);
//     handler.next(response)
//   }
// }, window);


// unProxy1();
// unProxy2();

testProxy()




