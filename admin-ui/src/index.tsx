import * as React from "react";
import * as ReactDOM from "react-dom";
import {LoginStatus} from "./components/loginStatus";


const loginElement = <LoginStatus />;
ReactDOM.render(loginElement, document.getElementById("login-status"));
