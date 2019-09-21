import {SessionTokenJson} from "../../../common-lib/src/apiInterfaces";
import * as React from "react";
import {checkLogin, getAuthCookie} from "../lib/authCheck";

interface SessionProps {
    session: SessionTokenJson
}
interface LoginStatusState {
    checkedLogin: boolean,
    session: SessionTokenJson | null
}

class LoginStatusLoggedin extends React.Component<SessionProps, {}> {
    render() {
        return <div>You are logged in as {this.props.session.username}</div>;
    }
}

export class LoginStatus extends React.Component<{}, LoginStatusState> {
    token: string;

    constructor(props: any) {
        super(props);
        this.token = getAuthCookie();
        this.state = {checkedLogin: false, session: null};
    }

    componentDidMount(): void {
        const self = this;
        checkLogin(this.token).then(function(loginSession) {
            self.setState({checkedLogin: true, session: loginSession});
        }).catch(function (err) {
            self.setState({checkedLogin: true, session: null});
        });
    }

    render() {
        if (this.state.checkedLogin) {
            if (this.state.session) {
                return <LoginStatusLoggedin session={this.state.session} />;
            } else {
                return <div>You are not logged in. <a href="./login.html">Go to login</a></div>
            }
        } else {
            return <div>Checking login...</div>;
        }
    }
}