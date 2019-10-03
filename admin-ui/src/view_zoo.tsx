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
import {ViewSelectorComponent} from "../../common-ui-lib/src/components/viewSelector";
import {toggleSelectionMembership} from "../../common-ui-lib/src/utilities";


interface ZooInfoProps {
    animalData: AnimalData;
    zoo: FullZooJson;
}
interface ZooInfoState {
    speciesList: SpeciesData[];
    zooSpecies: number[];
}
class ZooInfo extends React.Component<ZooInfoProps, ZooInfoState> {
    constructor(props: ZooInfoProps) {
        super(props);
        this.state = {speciesList: [], zooSpecies: this.props.zoo.species.map(x => x.species_id)};
    }

    async componentDidMount() {
        const listSpecies = await this.props.animalData.listSpecies();
        this.setState({speciesList: listSpecies});
    }

    async addSpecies(speciesId: number): Promise<void> {
        const newLink = await this.props.animalData.addZooSpeciesLink(this.props.zoo.zoo_id, speciesId);
        this.setState((state) => {return {zooSpecies: [newLink.species_id].concat(state.zooSpecies)}});
    }

    toggleSpecies(speciesId: number, selected?: boolean): void {
        console.log("Toggle " + speciesId + " " + selected);
        const self = this;
        this.setState(function(state) {
            const newSelection = toggleSelectionMembership(state.zooSpecies, speciesId, selected);
            if(newSelection.includes(speciesId)) {
                self.props.animalData.addZooSpeciesLink(self.props.zoo.zoo_id, speciesId).then(function() {
                    self.setState({zooSpecies: newSelection});
                });
            } else {
                self.props.animalData.deleteZooSpeciesLink(self.props.zoo.zoo_id, speciesId).then(function() {
                    self.setState({zooSpecies: newSelection});
                });
            }
        });
    }

    async newSpeciesCreated(speciesId: number): Promise<void> {
        this.toggleSpecies(speciesId, true);
    }

    render() {
        return <>
            <LoginStatus />
            Name: {this.props.zoo.name}<br />
            Postcode: {this.props.zoo.postcode}<br />
            Link: <a href={this.props.zoo.link}>{this.props.zoo.link}</a><br />
            Species list:<br />
            <ViewSelectorComponent
                animalData={this.props.animalData}
                selectedSpeciesIds={this.state.zooSpecies}
                onSelectSpecies={this.toggleSpecies.bind(this)}
                editableTaxonomy={true}
                newSpeciesCreated={this.newSpeciesCreated.bind(this)}
            />
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
