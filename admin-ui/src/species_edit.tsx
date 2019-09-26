import {getAuthCookie} from "./lib/authCheck";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {StatedTaxonomyView} from "@cervoio/common-ui-lib/src/components/taxonomyView";
import {AnimalData} from "@cervoio/common-ui-lib/src/animalData";
import {LoginStatus} from "./components/loginStatus";

document.addEventListener("DOMContentLoaded", async function() {
    ReactDOM.render(<LoginStatus />, document.getElementById('login-status'));
    const animalData = new AnimalData(getAuthCookie());
    ReactDOM.render(<StatedTaxonomyView
        selectedSpecies={[]}
        onSelectSpecies={null}
        animalData={animalData}
        editableTaxonomy={true}
    />, document.getElementById('animals-taxonomic'));
});
