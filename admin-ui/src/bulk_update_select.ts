import $ from "jquery";
import {getAuthCookie, updateLoginStatus} from "./lib/authCheck";
import {promiseGet} from "@cervoio/common-ui-lib/src/utilities";
import {CategoryJson, CategoryLevelJson, FullCategoryJson, SpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";

let categoryLevelCache: CategoryLevelJson[] = [];
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
        <span class="expand">${name}</span> 
        <span class='category_level'>${categoryLevelName}</span>
        <a href='bulk_update.html?category_id=${categoryId}'>🔍</a>
        </li>`);
    element.find(`li#${categoryLiId} span.expand`).on("click", function() {
        loadCategory(categoryId);
    })
}

function addSpecies(element: JQuery, speciesData: SpeciesJson) {
    //const speciesId = speciesData.species_id;
    const name = speciesData.common_name;
    const latinName = speciesData.latin_name;
    element.append(`<li class='species'>${name} <span class='latin_name'>${latinName}</span></li>`);
}

function loadCategory(id: number) {
    const categoryLiId = "category-"+id;
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    promiseGet("categories/"+id, authHeaders).then(function(data: FullCategoryJson[]) {
        const listElement = $("#"+categoryLiId);
        listElement.addClass("open");
        listElement.removeClass("closed");
        if(!listElement.has("ul").length) {
            listElement.append("<ul></ul>");
            // Add subcategories and species
            $.each(data[0].sub_categories, function (index, itemData) {
                addCategory(listElement.find("ul"), itemData);
            });
            $.each(data[0].species, function (index, itemData) {
                addSpecies(listElement.find("ul"), itemData);
            });
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
    })
}

document.addEventListener("DOMContentLoaded", async function() {
    await updateLoginStatus();
    categoryLevelCache = await promiseGet("category_levels/");
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    const categoriesList = await promiseGet("categories/", authHeaders);
    for(let category of categoriesList) {
        addCategory($("#animals"), category);
    }
});
