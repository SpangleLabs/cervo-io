import {config} from "./config";
import $ from "jquery";

const spinner: string = `<img class="spinner" src="images/spinner.svg" alt="⏳"/>`;

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

function addSpinner(element: JQuery<Element>): void {
    element.append(spinner);
}

function removeSpinner(element: JQuery<Element>): void {
    element.find("img.spinner").remove();
}

export function promiseSpinner<T>(element: JQuery<Element>, promise: Promise<T>): Promise<T> {
    addSpinner(element);
    return promise.then(function(data: T) {
        removeSpinner(element);
        return data;
    });
}

export function tickboxImageElem(selected: boolean): JQuery<HTMLElement> {
    return $(`<img src='images/${selected ? "box_checked.svg" : "box_unchecked.svg"}' alt='${selected ? "✔" : "➕"}'/>`);
}
