import {TaxonomyCategoryState} from "../../../taxonomyState";
import {NewCategoryJson, NewSpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";
import React from "react";
import {AddCategoryForm} from "./AddCategoryForm";
import {AddSpeciesForm} from "./AddSpeciesForm";

interface EditTaxonomyFormProps {
    parentCategory: TaxonomyCategoryState;
    addCategory: (newCategory: NewCategoryJson) => Promise<void>;
    addSpecies: (newSpecies: NewSpeciesJson) => Promise<void>;
}

export const EditTaxonomyForm: React.FunctionComponent<EditTaxonomyFormProps> = (props) => {
    if(props.parentCategory.data.categoryLevelId == 1) {
        return <AddSpeciesForm
            parentCategory={props.parentCategory}
            addSpecies={props.addSpecies}
        />
    } else {
        return <AddCategoryForm
            parentCategory={props.parentCategory}
            addCategory={props.addCategory}
        />
    }
}