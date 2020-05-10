import {TaxonomyCategoryState} from "../../../taxonomyState";
import {NewCategoryJson, NewSpeciesJson} from "../../../../../common-lib/src/apiInterfaces";
import * as React from "react";
import {AddCategoryForm} from "./AddCategoryForm";
import {AddSpeciesForm} from "./AddSpeciesForm";

interface EditTaxonomyFormProps {
    parentCategory: TaxonomyCategoryState;
    addCategory: (newCategory: NewCategoryJson) => Promise<void>;
    addSpecies: (newSpecies: NewSpeciesJson) => Promise<void>;
}
interface EditTaxonomyFormState {

}
export class EditTaxonomyForm extends React.Component<EditTaxonomyFormProps, EditTaxonomyFormState> {
    render() {
        if(this.props.parentCategory.data.categoryLevelId == 1) {
            return <AddSpeciesForm
                parentCategory={this.props.parentCategory}
                addSpecies={this.props.addSpecies}
            />
        } else {
            return <AddCategoryForm
                parentCategory={this.props.parentCategory}
                addCategory={this.props.addCategory}
            />
        }
    }
}
