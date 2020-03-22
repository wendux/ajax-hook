interface XMLHttpRequestProxy extends XMLHttpRequest {
    responseText: string,
    readyState: number;
    response: any;
    responseURL: string;
    responseXML: Document | null;
    status: number;
    statusText: string;
    xhr: OriginXMLHttpRequest
}

interface OriginXMLHttpRequest extends XMLHttpRequest {
    getProxy(): XMLHttpRequestProxy;
}

interface AttrGetterAndSetter<T = any> {
    getter?: (value: T, xhr: OriginXMLHttpRequest) => T;
    setter?: (value: T, xhr: OriginXMLHttpRequest) => T;
}

interface XhrRequestConfig {
    method: string,
    url: string,
    headers: any,
    body: any,
    async: boolean,
    user: string,
    password: string,
    withCredentials: boolean
    xhr: OriginXMLHttpRequest,
}

interface XhrResponse {
    config: XhrRequestConfig,
    headers: any,
    response: any,
    status: number,
    statusText?: string,
}

type XhrErrorType = 'error' | 'timeout' | 'abort'


interface XhrError {
    config: XhrRequestConfig,
    type: XhrErrorType
}

interface Hooks {
    onreadystatechange?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    onabort?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    onerror?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    onload?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    onloadend?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    onloadstart?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    onprogress?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    ontimeout?: ((this: XMLHttpRequestProxy, xhr: OriginXMLHttpRequest, ev: ProgressEvent) => any) | null;
    abort?: ((args: Array<any>, xhr: OriginXMLHttpRequest) => any);
    getAllResponseHeaders?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;
    getResponseHeader?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;
    open?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;
    overrideMimeType?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;
    send?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;
    setRequestHeader?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;
    addEventListener?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;
    removeEventListener?: (args: Array<any>, xhr: OriginXMLHttpRequest) => any;

    response?: AttrGetterAndSetter,
    responseText?: AttrGetterAndSetter<string>,
    readyState?: AttrGetterAndSetter<number>,
    responseType?: AttrGetterAndSetter<XMLHttpRequestResponseType>;
    responseURL?: AttrGetterAndSetter<string>;
    responseXML?: AttrGetterAndSetter<Document | null>;
    status?: AttrGetterAndSetter<number>;
    statusText?: AttrGetterAndSetter<string>;
    timeout?: AttrGetterAndSetter<number>;
    upload?: AttrGetterAndSetter<XMLHttpRequestUpload>;
    withCredentials?: AttrGetterAndSetter<boolean>;
}

interface XhrHandler {
    resolve(response: XhrResponse): void

    reject(err: XhrError): void
}

interface XhrRequestHandler extends XhrHandler {
    next(config: XhrRequestConfig): void
}

interface XhrResponseHandler extends XhrHandler {
    next(response: XhrResponse): void
}

interface XhrErrorHandler extends XhrHandler {
    next(error: XhrError): void
}

interface Proxy {
    onRequest?: (config: XhrRequestConfig, handler: XhrRequestHandler) => void,
    onResponse?: (response: XhrResponse, handler: XhrResponseHandler) => void,
    onError?: (err: XhrError, handler: XhrErrorHandler) => void,
}

export function proxy(proxy: Proxy): XMLHttpRequest;

export function unProxy();

export function hook(hooks: Hooks): XMLHttpRequest;

export function unHook();
