"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var test_1 = require("./test");
index_1.proxy({
    onRequest: function (config, handler) {
        if (config.url === 'https://aa/') {
            handler.resolve({
                config: config,
                status: 200,
                headers: { 'content-type': 'text/text' },
                response: 'hi world'
            });
        }
        else {
            handler.next(config);
        }
    },
    onError: function (err, handler) {
        if (err.config.url === 'https://bb/') {
            handler.resolve({
                config: err.config,
                status: 200,
                headers: { 'content-type': 'text/text' },
                response: 'hi world'
            });
        }
        else {
            handler.next(err);
        }
    },
    onResponse: function (response, handler) {
        if (response.config.url === location.href) {
            handler.reject({
                config: response.config,
                type: 'error'
            });
        }
        else {
            handler.next(response);
        }
    }
});
test_1.testProxy();
