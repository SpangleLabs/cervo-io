import {config} from "./config";

export function promiseGet(path: string, headers?: Map<string, string>): Promise<any> {
    return promiseRequest("GET", path, null, headers);
}

export function promisePost(path: string, data: any, headers?: Map<string, string>): Promise<any> {
    return promiseRequest("POST", path, data, headers);
}

export function promiseDelete(path: string, data: any, headers?: Map<string, string>): Promise<any> {
    return promiseRequest("DELETE", path, data, headers);
}

function promiseRequest(method: string, path: string, data?: any, headers?: Map<string, string>): Promise<any> {
    if(!headers) {
        headers = new Map<string, string>();
    }
    const url = config['api_url'] + path;

    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        let req = new XMLHttpRequest();
        req.open(method, url);
        if(data) req.setRequestHeader("Content-type", "application/json");
        for(let key of headers.keys()) {
            req.setRequestHeader(key, headers.get(key));
        }
        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status === 200) {
                // Resolve the promise with the response text
                resolve(JSON.parse(req.responseText));
            } else if(req.status === 204) {
                resolve();
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.responseText));
            }
        };
        // Handle network errors
        req.onerror = function () {
            reject(Error("Network Error"));
        };
        // Make the request
        if(data) {
            req.send(JSON.stringify(data));
        } else {
            req.send();
        }
    });
}

export function arrayEquals<T>(array1: T[], array2: T[]): boolean {
    if (array1 == null || array2 == null) return false;
    if (array1.length !== array2.length) return false;
    array1.sort();
    array2.sort();
    for(let idx = 0; idx < array1.length; idx++) {
        if (array1[idx] !== array2[idx]) return false;
    }
    return true;
}

export function toggleSelectionMembership<T>(selection: T[], element: T, selected?: boolean): T[] {
    if(selected == null) {
        // Toggle species
        if(selection.includes(element)) {
            return selection.filter((id) => element != id)
        } else {
            return selection.concat(element)
        }
    } else if(selected) {
        // Add species
        if(!selection.includes(element)) {
            return selection.concat(element)
        }
        return selection;
    } else {
        // Remove species
        if(selection.includes(element)) {
            return selection.filter((id) => element != id)
        }
        return selection;
    }
}

export function getAuthCookie(): string {
    return document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

export async function withLoading(setLoading: (loading: boolean) => void, action: () => Promise<void>) {
    setLoading(true)
    const resp = await action()
    setLoading(false)
    return resp
}