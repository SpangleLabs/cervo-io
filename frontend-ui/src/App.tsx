import {Route, Router, Switch} from "react-router";
import React from "react";
import {useHistory} from 'react-router-dom'
import {createBrowserHistory} from "history";
import ReactDOM from "react-dom";
import {MainComponent} from "./MainComponent";
import {NavTopBar, NavTopBarOptions} from "./NavTopBar";
import {FAQ} from "./FAQ";

const browserHistory = createBrowserHistory({
    basename: "/"
})

export const App: React.FunctionComponent= () => {
    return (
        <Router history={browserHistory}>
            <Routes/>
        </Router>
    )
}

export const Routes: React.FunctionComponent = () => {
    const history = useHistory()

    return (
        <Switch>
            <Route exact path={["/", "/list-species"]}>
                <NavTopBar selected={NavTopBarOptions.bySpecies} history={history} />
                <MainComponent history={history}/>
            </Route>
            <Route exact path="/faq">
                <NavTopBar selected={NavTopBarOptions.faq} history={history} />
                <FAQ />
            </Route>
            <Route exact path="/list-zoos">
                <NavTopBar selected={NavTopBarOptions.byZoos} history={history} />
                Zoo listing is under construction
            </Route>
        </Switch>
    )
}



document.addEventListener("DOMContentLoaded", function () {
    ReactDOM.render(<App/>, document.getElementById("main"));
});
