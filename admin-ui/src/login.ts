import $ from "jquery";
import {SessionTokenJson} from "@cervoio/common-lib/src/apiInterfaces";
import {promisePost} from "@cervoio/common-ui-lib/src/utilities";
import {checkLogin, getAuthCookie} from "./lib/authCheck";

function setAuthCookie(token: string) {
    let d = new Date();
    d.setTime(d.getTime() + (7 * 86400 * 1000)); //Expires in 7 days
    const expires = "expires="+d.toUTCString();
    document.cookie = "auth_token="+token+";"+expires+";path=/";
}

function login() {
    const username = $("input#form_username").val();
    const password = $("input#form_password").val();
    // Post to API
    promisePost("session/", {"username": username, "password": password}).then(function(resp: SessionTokenJson) {
        // Get auth token
        const authToken = resp.token;
        // Set token as cookie?
        setAuthCookie(authToken);
        // Redirect to index
        window.location.replace("index.html");
    }).catch(function(err) {
        console.log("Failed to login: "+err.message);
        $("#failed-login").show();
    });
    // Redirect to index?
    return false;
}

function updateLoginStatus(token: string) {
    checkLogin(token).then(function (response) {
        $("#login-status").text("Currently logged in as " + response['username']);
    }).catch(function (err) {
        $("#login-status").text("Login token failure: " + err.message);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    $("#login_form").on("submit", login);
    const cookie = getAuthCookie();
    if(cookie) {
        $("#login-status").text("You currently have an auth cookie set.");
        updateLoginStatus(cookie);
    } else {
        $("#login-status").text("Not currently logged in.");
    }
});