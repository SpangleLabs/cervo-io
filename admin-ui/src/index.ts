import $ from "jquery";
import {checkLogin, getAuthCookie} from "./lib/authCheck";

$(document).ready(function() {
    const token = getAuthCookie();
    checkLogin(token).then(function(isLogin) {
        if(isLogin) {
            $("#login-status").text(`You are logged in as ${isLogin.username}`);
        } else {
            $("#login-status").html(`You are not logged in. <a href="login.html">Go to login</a>`);
        }
    })
});
