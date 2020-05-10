import {TaxonomyCategoryState} from "../../../taxonomyState";
import {NewSpeciesJson} from "../../../../../common-lib/src/apiInterfaces";
import * as React from "react";
import {ChangeEvent, FormEvent} from "react";

interface AddSpeciesFormProps {
    parentCategory: TaxonomyCategoryState;
    addSpecies: (newSpecies: NewSpeciesJson) => Promise<void>;
}
interface AddSpeciesFormState {
    commonName: string;
    latinName: string;
    hidden: boolean;
}
export class AddSpeciesForm extends React.Component<AddSpeciesFormProps, AddSpeciesFormState> {
    constructor(props: AddSpeciesFormProps) {
        super(props);
        const starterLatinName = this.props.parentCategory.data.name + " ";
        this.state = {commonName: "", latinName: starterLatinName, hidden: true}
    }

    onChangeCommonName(event: ChangeEvent<HTMLInputElement>) {
        let commonName = event.target.value;
        if (commonName.length > 0) {
            commonName = commonName[0].toUpperCase() + commonName.substr(1);
        }
        this.setState({commonName: commonName});
    }

    onChangeLatinName(event: ChangeEvent<HTMLInputElement>) {
        this.setState({latinName: event.target.value.toLowerCase()});
    }

    onChangeHidden(event: ChangeEvent<HTMLInputElement>) {
        this.setState({hidden: event.target.checked});
    }

    async onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const newSpecies: NewSpeciesJson = {
            common_name: this.state.commonName,
            latin_name: this.state.latinName,
            category_id: this.props.parentCategory.data.id,
            hidden: this.state.hidden
        };
        const self = this;
        await this.props.addSpecies(newSpecies);
        const starterLatinName = this.props.parentCategory.data.name + " ";
        self.setState({commonName: "", latinName: starterLatinName, hidden: true});
    }

    render() {
        return <li>
            <span>Add species </span>
            <form onSubmit={this.onSubmit.bind(this)}>
                <input type='text' placeholder='Common name' value={this.state.commonName} onChange={this.onChangeCommonName.bind(this)} />
                <input type='text' placeholder='latin name' value={this.state.latinName} onChange={this.onChangeLatinName.bind(this)} />
                <label>Hidden?<input type='checkbox' checked={this.state.hidden} onChange={this.onChangeHidden.bind(this)} /></label>
                <input type='submit'/>
            </form>
        </li>
    }
}
