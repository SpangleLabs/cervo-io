import config from "./config";

export const spinner: string = `<img class="spinner" src="images/spinner.svg" alt="⏳"/>`;

/**
 * I pulled this method from somewhere else, tbh
 * @param path API relative path
 * @returns {Promise<object>}
 */
export function promiseGet(path: string): Promise<any> {
    const url = config['api_url'] + path;
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        let req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status === 200) {
                // Resolve the promise with the response text
                resolve(JSON.parse(req.responseText));
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function () {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send();
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
