import {Route, Router, Switch} from "react-router";
import React from "react";
import {useHistory} from 'react-router-dom'
import {createBrowserHistory} from "history";
import ReactDOM from "react-dom";
import {ListSpeciesPage} from "./ListSpeciesPage";
import {NavTopBar, NavTopBarOptions} from "./NavTopBar";
import {FAQPage} from "./FAQPage";

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

    const changePage = (page: string) => {
        history.push(page)
    }

    const changeSpeciesList = (speciesIds: number[]) => {
        console.log(speciesIds)
        history.push("/list-species/" + speciesIds.join("-"))
    }

    return (
        <Switch>
            <Route exact path={["/", "/list-species", "/list-species/:ids"]} children={({match}) => (
                <>
                <NavTopBar selected={NavTopBarOptions.bySpecies} changePage={changePage} />
                <ListSpeciesPage changeSpeciesList={changeSpeciesList} match={match}/>
                </>
            )} />
            <Route exact path="/faq">
                <NavTopBar selected={NavTopBarOptions.faq} changePage={changePage} />
                <FAQPage />
            </Route>
            <Route exact path="/list-zoos">
                <NavTopBar selected={NavTopBarOptions.byZoos} changePage={changePage} />
                Zoo listing is under construction
            </Route>
        </Switch>
    )
}



document.addEventListener("DOMContentLoaded", function () {
    ReactDOM.render(<App/>, document.getElementById("main"));
});
