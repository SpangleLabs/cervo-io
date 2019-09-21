import * as ReactDOM from "react-dom";
import {
    NonSelectableTaxonomyViewComponent
} from "../common-ui-lib/src/components/taxonomyView";
import * as React from "react";
import {AnimalData} from "../common-ui-lib/src/animalData";

document.addEventListener("DOMContentLoaded", async function() {
    const animalData = new AnimalData();
    ReactDOM.render(<NonSelectableTaxonomyViewComponent
        animalData={animalData}
    />, document.getElementById('animals-taxonomic'));

});
