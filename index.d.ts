interface AjaxHook{
    hookAjax(hookObject:object);
    unHookAjax();
}
declare const ah:AjaxHook;
export default ah;