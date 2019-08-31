import {promiseGet} from "@cervoio/common-ui-lib/src/utilities";
import {SessionTokenJson} from "@cervoio/common-lib/src/apiInterfaces";
import $ from "jquery";


export function getAuthCookie(): string {
    return document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

export function checkLogin(token: string): Promise<SessionTokenJson> {
    const headers = new Map<string, string>();
    headers.set("authorization", token);
    return promiseGet("session/", headers).then(function (response: SessionTokenJson) {
        return response;
    }).catch(function (err) {
        throw err;
    });
}

export function updateLoginStatus() {
    const token = getAuthCookie();
    return checkLogin(token).then(async function(isLogin) {
        $("#login-status").text(`You are logged in as ${isLogin.username}`);
    }).catch(function (err) {
        $("#login-status").html(`You are not logged in. <a href="login.html">Go to login</a>`);
        throw err;
    });
}
