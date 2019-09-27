import {
    FullZooJson,
    SpeciesEntryForZooJson
} from "@cervoio/common-lib/src/apiInterfaces";
import {getAuthCookie} from "./lib/authCheck";
import {LoginStatus} from "./components/loginStatus";
import * as React from "react";
import {AnimalData, SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {HiddenStatus} from "@cervoio/common-ui-lib/src/components/taxonomyView";
import * as ReactDOM from "react-dom";
import {ChangeEvent, FormEvent} from "react";


interface ZooInfoProps {
    animalData: AnimalData;
    zoo: FullZooJson;
}
interface ZooInfoState {
    speciesList: SpeciesData[];
    zooSpecies: SpeciesEntryForZooJson[];
}
class ZooInfo extends React.Component<ZooInfoProps, ZooInfoState> {
    constructor(props: ZooInfoProps) {
        super(props);
        this.state = {speciesList: [], zooSpecies: this.props.zoo.species};
    }

    async componentDidMount() {
        const listSpecies = await this.props.animalData.listSpecies();
        this.setState({speciesList: listSpecies});
    }

    async addSpecies(speciesId: number): Promise<void> {
        const newLink = await this.props.animalData.addZooSpeciesLink(this.props.zoo.zoo_id, speciesId);
        const species = this.state.speciesList.filter(x => x.id == speciesId)[0];
        const newEntry: SpeciesEntryForZooJson = {
            zoo_species_id: newLink.zoo_species_id,
            zoo_id: newLink.zoo_id,
            species_id: newLink.species_id,
            common_name: species.commonName,
            latin_name: species.latinName,
            category_id: species.parentCategoryId,
            hidden: species.hidden
        };
        this.setState((state) => {return {zooSpecies: [newEntry].concat(state.zooSpecies)}});
    }

    render() {
        return <>
            <LoginStatus />
            Name: {this.props.zoo.name}}<br />
            Postcode: {this.props.zoo.postcode}<br />
            Link: <a href={this.props.zoo.link}>{this.props.zoo.link}</a><br />
            Species list:<br />
            <AddZooSpeciesForm
                animalData={this.props.animalData}
                speciesList={this.state.speciesList}
                addSpecies={this.addSpecies.bind(this)}
            />
            <ul id="species_list">
                {this.state.zooSpecies.map(species => <SpeciesEntry key={species.zoo_species_id} species={species} />)}
            </ul>
        </>
    }
}

interface SpeciesEntryProps {
    species: SpeciesEntryForZooJson;
}
interface SpeciesEntryState {

}
class SpeciesEntry extends React.Component<SpeciesEntryProps, SpeciesEntryState> {
    render() {
        return <li>
            <span className="common_name">{this.props.species.common_name}</span>
            <span className="latin_name">{this.props.species.latin_name}</span>
            <HiddenStatus hidden={this.props.species.hidden}/>
        </li>;
    }
}

interface AddZooSpeciesFormProps {
    animalData: AnimalData;
    speciesList: SpeciesData[];
    addSpecies: (speciesId: number) => Promise<void>
}
interface AddZooSpeciesFormState {
    value: number;
}
class AddZooSpeciesForm extends React.Component<AddZooSpeciesFormProps, AddZooSpeciesFormState> {
    constructor(props: AddZooSpeciesFormProps) {
        super(props);
        this.state = {value: 0}
    }

    async onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if(this.state.value != 0) {
            await this.props.addSpecies(this.state.value);
            this.setState({value: 0});
        }
    }

    handleChange(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({value: Number(event.target.value)});
    }

    render() {
        return <form onSubmit={this.onSubmit.bind(this)}>
            <select onChange={this.handleChange.bind(this)} value={this.state.value}>
                <option value={0} disabled={true}>Select species</option>
                {this.props.speciesList.map(x => <option value={x.id}>{x.commonName}</option>)}
            </select>
            <input type="submit" disabled={this.state.value == 0} value="Add species to zoo"/>
        </form>
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const animalData = new AnimalData(getAuthCookie());
    const searchParams = new URLSearchParams(window.location.search);
    const zooId = Number(searchParams.get("id"));
    const zoo = await animalData.promiseFullZoo(zooId);
    ReactDOM.render(<ZooInfo animalData={animalData} zoo={zoo} />, document.getElementById('zoo-info'));
});
