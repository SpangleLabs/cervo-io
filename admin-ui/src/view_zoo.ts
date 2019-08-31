import $ from "jquery";
import {promiseGet, promisePost} from "../../common-ui-lib/src/utilities";
import {
    NewZooSpeciesLinkJson,
    SpeciesEntryForZooJson,
    SpeciesJson,
    ZooSpeciesLinkJson
} from "../../common-lib/src/apiInterfaces";
import {getAuthCookie, updateLoginStatus} from "./lib/authCheck";

async function loadZooData(zooId: number) {
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    const zoosResults = await promiseGet("zoos/"+zooId, authHeaders);
    const zooData = zoosResults[0];
    $(".name").append(zooData.name);
    $(".postcode").append(zooData.postcode);
    $(".link").append(`<a href="${zooData.link}">${zooData.link}</a>`);
    for(let zooSpecies of zooData.species) {
        addZooSpeciesToList(zooSpecies);
    }
}

function addZooSpeciesToList(zooSpecies: SpeciesEntryForZooJson) {
    $("#species_list").append("<li>"+zooSpecies.common_name+" " +
        "<span class='latin_name'>"+zooSpecies.latin_name+"</span></li>");
}

async function addSpeciesButton(zooId: number) {
    $("input#input-zoo_id").val(zooId);
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    const speciesList = await promiseGet("species/", authHeaders);
    for(let species of speciesList) {
        $("select#species_id").append("<option value="+species.species_id+">"+species.common_name+"</option>");
    }
}

async function sendAddSpecies(zooId: number) {
    const speciesId = Number($("select#species_id").find(":selected").val());
    const zooSpecies: NewZooSpeciesLinkJson = {
        zoo_id: zooId,
        species_id: speciesId
    };
    console.log(zooSpecies);
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    const newLink: ZooSpeciesLinkJson = await promisePost("zoo_species/", zooSpecies, authHeaders);
    const speciesData: SpeciesJson[] = await promiseGet("species/"+newLink.species_id, authHeaders);
    console.log(speciesData);
    const speciesEntry: SpeciesEntryForZooJson = {
        zoo_species_id: newLink.zoo_species_id,
        zoo_id: zooId,
        species_id: newLink.species_id,
        common_name: speciesData[0].common_name,
        latin_name: speciesData[0].latin_name,
        category_id: speciesData[0].category_id,
        hidden: speciesData[0].hidden
    };
    console.log(speciesEntry);
    addZooSpeciesToList(speciesEntry);
}

document.addEventListener("DOMContentLoaded", async function() {
    await updateLoginStatus();
    const searchParams = new URLSearchParams(window.location.search);
    const zooId = Number(searchParams.get("id"));
    await loadZooData(zooId);
    await addSpeciesButton(zooId);
    $("form#addSpecies").on("submit", function(e) {
        e.preventDefault();
        sendAddSpecies(zooId);
    })
});
