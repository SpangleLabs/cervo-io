import $ from "jquery";
import {updateLoginStatus} from "./lib/authCheck";
import {promiseGet} from "@cervoio/common-ui-lib/src/utilities";
import {FullCategoryJson, FullSpeciesJson, FullZooJson} from "@cervoio/common-lib/src/apiInterfaces";

const zooSpecies: Map<number, number[]> = new Map<number, number[]>();
let tableElem = $("table#update_table");

function domAddZooRow(zooData: FullZooJson, speciesList: FullSpeciesJson[]) {
    const zooRow = $(`<tr>`);
    zooRow.append(`<td><a href="view_zoo.html?id=${zooData.zoo_id}">${zooData.name}</a></td>`);
    for(let species of speciesList) {
        const zooId = zooData.zoo_id;
        const speciesId = species.species_id;
        const zooHasSpecies = zooSpecies.get(zooId) && zooSpecies.get(zooId).indexOf(speciesId) !== -1;
        const zooSpeciesCheckbox = $(`<td id='zoospecies-${zooId}-${speciesId}'>
            <input type='checkbox' ${zooHasSpecies ? "checked " : ""}/>
            </td>`);
        zooSpeciesCheckbox.on("change", function () {
            eventToggleCheckbox(zooId, speciesId);
        });
        zooRow.append(zooSpeciesCheckbox);
    }
    tableElem.append(zooRow);
}

function domAddSpeciesColHeaders(speciesList: FullSpeciesJson[]) {
    let colHeaders = "<thead><tr><td></td>";
    colHeaders += speciesList.map(x => `<th><div class="species_name">${x.common_name}</div></th>`).join();
    colHeaders += "</tr></thead>";
    tableElem.append(colHeaders);
}

async function promiseGetSpecies(speciesId: number): Promise<FullSpeciesJson> {
    const species = await promiseGet("species/"+speciesId);
    return species[0];
}

async function promiseGetCategory(categoryId: number): Promise<FullCategoryJson> {
    const categories = await promiseGet("categories/"+categoryId);
    return categories[0];
}

async function promiseGetSpeciesFromCategory(categoryId: number): Promise<FullSpeciesJson[]> {
    // Get category data, and collect species and subcategories
    const categoryData: FullCategoryJson = await promiseGetCategory(categoryId);
    const promiseSpecies: Promise<FullSpeciesJson[]> = Promise.all(categoryData.species.map(x => promiseGetSpecies(x.species_id)));
    const promiseSubCatSpecies: Promise<FullSpeciesJson[][]> = Promise.all(categoryData.sub_categories.map(x => promiseGetSpeciesFromCategory(x.category_id)));

    // Await the species data, and the sub categories species list
    const [species, subCategorySpecies] = await Promise.all([promiseSpecies, promiseSubCatSpecies]);

    // Flatten list of subcategory species
    let allSpecies: FullSpeciesJson[] = species;
    subCategorySpecies.forEach(x => allSpecies = allSpecies.concat(x));

    return allSpecies;
}

async function listZoos(): Promise<FullZooJson[]> {
    return await promiseGet("zoos/");
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
    const speciesList = await promiseGetSpeciesFromCategory(categoryId);
    // Add species to map
    for(let species of speciesList) {
        for(let zoo of species.zoos) {
            if(!zooSpecies.get(zoo.zoo_id)) {
                zooSpecies.set(zoo.zoo_id, []);
            }
            const zooSpeciesList = zooSpecies.get(zoo.zoo_id);
            zooSpeciesList.push(species.species_id);
            zooSpecies.set(zoo.zoo_id, zooSpeciesList);
        }
    }
    // Add species to dom
    domAddSpeciesColHeaders(speciesList);
    // Get list of zoos
    const zooList = await listZoos();
    // Add zoo list
    for(let a = 0; a < zooList.length; a++) {
        domAddZooRow(zooList[a], speciesList);
        if(a % 20 === 19) {
            domAddSpeciesColHeaders(speciesList);
        }
    }
});
