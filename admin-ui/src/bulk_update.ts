import $ from "jquery";
import {updateLoginStatus} from "./lib/authCheck";
import {promiseGet} from "@cervoio/common-ui-lib/src/utilities";
import {FullCategoryJson, FullSpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";

let listSpecies = [];
let zooSpecies = {};
let tableElem = $("table#update_table");

function domAddZooRow(zooData) {
    var tableBodyElem = $("table#update_table");//" tbody");
    var zooRow = "<tr><td><a href="+zooData.zoo_id+"'view_zoo.html?id='>"+zooData.name+"</a></td>";
    for(var a = 0; a < listSpecies.length; a++) {
        var zooId = zooData.zoo_id;
        var speciesId = listSpecies[a].species_id;
        zooRow += "<td id='zoospecies-"+zooId+"-"+speciesId+"'>" +
            "<input type='checkbox' onchange='eventToggleCheckbox("+zooId+","+speciesId+")'";
        if(zooSpecies[zooId] && zooSpecies[zooId].indexOf(speciesId) !== -1) {
            zooRow += "checked ";
        }
        zooRow += "/>" +
            "</td>";
    }
    zooRow += "</tr>";
    tableBodyElem.append(zooRow);
}

function domAddSpeciesColHeaders(speciesList) {
    var colHeaders = "<thead><tr><td></td>";
    for(var a = 0; a < speciesList.length; a++) {
        colHeaders += "<th><div class='species_name'>"+speciesList[a].common_name+"</div></th>";
    }
    colHeaders += "</tr></thead>";
    tableElem.append(colHeaders);
}

function promiseGetSpecies(speciesId: number): Promise<FullSpeciesJson[]> {
    //return a species promise which returns species data
    return promiseGet("species/"+speciesId);
}

function promiseRawGetCategory(categoryId: number): Promise<FullCategoryJson[]> {
    return promiseGet("categories/"+categoryId);
}

function promiseGetCategory(categoryId: number): Promise<FullSpeciesJson[]> {
    //return a category promise which returns species promises
    const categoryPromises: Promise<FullSpeciesJson[]>[] = [];
    const speciesPromises: Promise<FullSpeciesJson[]>[] = [];
    const result = promiseRawGetCategory(categoryId).then(function(data) {
        for(let category of data) {
            for(let species of category.species) {
                speciesPromises.push(promiseGetSpecies(species.species_id));
            }
            for(let subCategory of category.sub_categories) {
                categoryPromises.push(promiseGetCategory(subCategory.category_id));
            }
        }
        return Promise.all(categoryPromises);
    }).then(function(specPromises) {
        const specPromisesConcat = Array.prototype.concat.apply([],specPromises);
        return speciesPromises.concat(specPromisesConcat);
    });
    return result;
}

function listZoos() {
    return promiseGet("zoos/");
}

function sendAddSpecies(zooId, speciesId) {
    var zooSpecies = {};
    zooSpecies.zoo_id = zooId;
    zooSpecies.species_id = speciesId;
    console.log(zooSpecies);
    $.post(config["api_url"]+"zoo_species/", zooSpecies);
}

function sendDelSpecies(zooId, speciesId) {
    var zooSpecies = {};
    zooSpecies.zoo_id = zooId;
    zooSpecies.species_id = speciesId;
    console.log(zooSpecies);
    $.ajax({
        url: config["api_url"]+"zoo_species/",
        type: "DELETE",
        data: zooSpecies
    });
}

function eventToggleCheckbox(zooId, speciesId) {
    var checkboxElem = $("td#zoospecies-"+zooId+"-"+speciesId+" input[type=checkbox]");
    if(checkboxElem.is(":checked")) {
        sendAddSpecies(zooId, speciesId);
    } else {
        sendDelSpecies(zooId, speciesId);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await updateLoginStatus();
    // Read get variable
    const searchParams = new URLSearchParams(window.location.search);
    const categoryId = Number(searchParams.get("category_id"));
    // Get list of species
    promiseGetCategory(categoryId).then(function(data) {
        return Promise.all(data);
    }).then(function(speciesData) {
        // Add species to map
        for(var a = 0; a < speciesData.length; a++) {
            var species = speciesData[a][0];
            listSpecies.push(species);
            var speciesId = species.species_id;
            for(var b = 0; b < species.zoos.length; b++) {
                var zooId = species.zoos[b].zoo_id;
                if(!(zooId in zooSpecies)) {
                    zooSpecies[zooId] = [];
                }
                zooSpecies[zooId].push(speciesId);
            }
        }
        // Add species to dom
        domAddSpeciesColHeaders(listSpecies);
        // Get list of zoos
        return listZoos();
    }).then(function(zooData) {
        // Add zoo list
        //tableElem.append("<tbody></tbody>");
        for(var a = 0; a < zooData.length; a++) {
            domAddZooRow(zooData[a]);
            if(a % 20 === 19) {
                domAddSpeciesColHeaders(listSpecies);
            }
        }
    });
});
