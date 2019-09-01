import $ from "jquery";
import {promiseGet, promisePost} from "../../common-ui-lib/src/utilities";
import {
    CategoryJson,
    CategoryLevelJson, FullCategoryJson,
    NewCategoryJson,
    NewSpeciesJson,
    SpeciesJson
} from "../../common-lib/src/apiInterfaces";
import {getAuthCookie, updateLoginStatus} from "./lib/authCheck";

let categoryLevelCache: CategoryLevelJson[] = [];
function getCategoryLevels() {
    return categoryLevelCache;
}
function getCategoryLevel(id: number): CategoryLevelJson | null {
    for(let categoryLevel of categoryLevelCache) {
        if (categoryLevel.category_level_id === id) {
            return categoryLevel;
        }
    }
    return null;
}

function addCategory(element: JQuery, categoryData: CategoryJson) {
    const categoryId = categoryData.category_id;
    const name = categoryData.name;
    const categoryLevelId = categoryData.category_level_id;
    const categoryLiId = "category-"+categoryId;
    const categoryLevelName = getCategoryLevel(categoryLevelId).name;
    element.append(`<li class='category closed' id='${categoryLiId}'>
    <span class='load_category'>${name}</span> <span class='category_level'>${categoryLevelName}</span>
    ${categoryData.hidden ? "⛔" : "👁️"}
    </li>`);
    $(`#${categoryLiId} > span.load_category`).on("click", function() {
        loadCategory(categoryData.category_id);
    });
}

function addSpecies(element: JQuery, speciesData: SpeciesJson) {
    //var speciesId = speciesData.species_id;
    const name = speciesData.common_name;
    const latinName = speciesData.latin_name;
    element.append(`<li class='species'>
    ${name} <span class='latin_name'>${latinName}</span>
    ${speciesData.hidden ? "⛔" : "👁️"}
    </li>`);
}

function addNewSpeciesForm(element: JQuery, parentCategoryId: number) {
    element.find("ul").append("<li class='species add'>" +
        "<span>Add species </span>" +
        "<form class='addSpecies'>" +
        "<input class='name' type='text' name='name'/>" +
        "<input class='latin_name' type='text' name='latin_name'>" +
        "<input type='submit' />" +
        "</form></li>");
    element.find("ul > li.add > span").on("click", function () {
        displayForm(parentCategoryId);
    });
    element.find("ul > li.add > form.addSpecies").on("submit", async function (e) {
        e.preventDefault();
        await sendAddSpecies(parentCategoryId);
    });
}

function addNewCategoryForm(element: JQuery, parentCategoryId: number, currentLevelId?: number) {
    let formString = `<li class='category add category-add-${parentCategoryId}'>
        <span>Add category </span>
        <form class='addCategory'>
        <input class='name' type='text' name='name'/>
        <select class='category_level_id' name='category_level_id'>`;
    const catLevels = getCategoryLevels();
    for(let categoryLevel of catLevels) {
        formString += `<option value='${categoryLevel.category_level_id}' ${categoryLevel.category_level_id == currentLevelId ? "selected" : ""}>${categoryLevel.name}</option>`;
    }
    formString += `</select>
        <input type='submit'/>
        </form></li>`;
    element.find("ul").append(formString);
    const newElem = $("li.category-add-"+parentCategoryId);
    newElem.find("span").on("click", function() {
        displayForm(parentCategoryId);
    });
    newElem.find("form.addCategory").on("submit", async function() {
        await sendAddCategory(parentCategoryId);
    });
}

function displayForm(id: number) {
    $("#category-"+id).find("form").show();
}

async function sendAddSpecies(categoryId: number): Promise<void> {
    const formElement = $("#category-"+categoryId).find("form.addSpecies");
    const inputName = <string>formElement.find("input.name").val();
    const inputLatin = <string>formElement.find("input.latin_name").val();
    const inputObj: NewSpeciesJson = {
        common_name: inputName,
        latin_name: inputLatin,
        category_id: categoryId,
        hidden: false
    };
    console.log(inputObj);
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    await promisePost("species/", inputObj, authHeaders);
    formElement.trigger("reset");
}

async function sendAddCategory(categoryId: number): Promise<boolean> {
    const formElement = $("#category-"+categoryId).find("form.addCategory");
    const inputName = <string>formElement.find("input.name").val();
    const inputlevelId = Number(formElement.find("select").find(":selected").val());
    const inputObj: NewCategoryJson = {
        name: inputName,
        category_level_id: inputlevelId,
        parent_category_id: categoryId,
        hidden: false
    };
    console.log(inputObj);
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    await promisePost("categories/", inputObj, authHeaders);
    formElement.trigger("reset");
    return false;
}

function loadCategory(id: number) {
    const categoryLiId = "category-"+id;
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    promiseGet("categories/"+id, authHeaders).then(function(data: FullCategoryJson[]) {
        const listElement = $("#"+categoryLiId);
        const isOdd = listElement.parent("ul").hasClass("odd");
        listElement.addClass("open");
        listElement.removeClass("closed");
        if(!listElement.has("ul").length) {
            listElement.append("<ul class='"+(isOdd?"even":"odd")+"'></ul>");
            // Add subcategories and species
            let currentLevelId = null;
            for(let subCategory of data[0].sub_categories) {
                currentLevelId = subCategory.category_level_id;
                addCategory(listElement.find("ul"), subCategory);
            }
            for(let species of data[0].species) {
                addSpecies(listElement.find("ul"), species);
            }
            // Adding forms
            if(data[0].category_level_id === 1) {
                addNewSpeciesForm(listElement, id);
            } else {
                addNewCategoryForm(listElement, id, currentLevelId);
            }
            // If category contains only 1 subcategory, open the subcategory.
            if(data[0].sub_categories.length === 1 && data[0].species.length === 0) {
                loadCategory(data[0].sub_categories[0].category_id);
            }
        } else if(!listElement.find("ul").is(":visible")) {
            listElement.find("ul").first().show();
            listElement.addClass("open");
            listElement.removeClass("closed");
        } else {
            listElement.find("ul").first().hide();
            listElement.addClass("closed");
            listElement.removeClass("open");
        }
    });
}

document.addEventListener("DOMContentLoaded", async function() {
    await updateLoginStatus();
    categoryLevelCache = await promiseGet("category_levels/");
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    const data: CategoryJson[] = await promiseGet("categories/", authHeaders);
    for(let category of data) {
        addCategory($("#animals"), category);
    }
});
