import {config} from "../admin_config";
import {promiseGet} from "@cervoio/common-ui-lib/src/utilities";
import {SessionTokenJson} from "@cervoio/common-lib/src/apiInterfaces";


export function getAuthCookie(): string {
    return document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

export function checkLogin(token: string): Promise<SessionTokenJson|null> {
    const headers = new Map<string, string>();
    headers.set("authorization", token);
    return promiseGet(config['api_url'] + "session/", headers).then(function (response: SessionTokenJson) {
        return response;
    }).catch(function (err) {
        return null;
    });
}