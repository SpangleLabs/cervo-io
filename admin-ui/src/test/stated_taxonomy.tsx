import ReactDOM from "react-dom";
import {
    StatedTaxonomyView
} from "@cervoio/common-ui-lib/src/components/taxonomyView/StatedTaxonomyView";
import React from "react";
import {AnimalData} from "@cervoio/common-ui-lib/src/animalData";

document.addEventListener("DOMContentLoaded", async function() {
    const animalData = new AnimalData();
    ReactDOM.render(<StatedTaxonomyView
        animalData={animalData}
    />, document.getElementById('animals-taxonomic'));
});
