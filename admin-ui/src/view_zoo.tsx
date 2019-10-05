import {
    FullZooJson
} from "@cervoio/common-lib/src/apiInterfaces";
import {getAuthCookie} from "./lib/authCheck";
import {LoginStatus} from "./components/loginStatus";
import * as React from "react";
import {AnimalData, SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {HiddenStatus} from "@cervoio/common-ui-lib/src/components/taxonomyView";
import * as ReactDOM from "react-dom";
import {ViewSelectorComponent} from "../../common-ui-lib/src/components/viewSelector";
import {toggleSelectionMembership} from "../../common-ui-lib/src/utilities";


interface ZooInfoProps {
    animalData: AnimalData;
    zoo: FullZooJson;
}
interface ZooInfoState {
    speciesList: SpeciesData[];
    zooSpecies: SpeciesData[];
}
class ZooInfo extends React.Component<ZooInfoProps, ZooInfoState> {
    constructor(props: ZooInfoProps) {
        super(props);
        this.state = {speciesList: [], zooSpecies: []};
    }

    async componentDidMount() {
        const listSpecies = await this.props.animalData.listSpecies();
        this.setState({speciesList: listSpecies});
        const zooSpecies = await this.props.zoo.species.map(x => this.props.animalData.species.get(x.species_id));
        this.setState({zooSpecies: zooSpecies});
    }

    async addSpecies(speciesId: number): Promise<void> {
        const newLink = await this.props.animalData.addZooSpeciesLink(this.props.zoo.zoo_id, speciesId);
        const newSpecies = this.props.animalData.species.get(newLink.species_id);
        this.setState((state) => {return {zooSpecies: [newSpecies].concat(state.zooSpecies)}});
    }

    toggleSpecies(speciesId: number, selected?: boolean): void {
        const species = this.props.animalData.species.get(speciesId);
        const self = this;
        this.setState(function(state) {
            const newSelection = toggleSelectionMembership(state.zooSpecies, species, selected);
            if(newSelection.includes(species)) {
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
                selectedSpeciesIds={this.state.zooSpecies.map(x => x.id)}
                selectableSpecies={true}
                selectableCategories={false}
                onSelectSpecies={this.toggleSpecies.bind(this)}
                editableTaxonomy={true}
                onNewSpeciesCreated={this.newSpeciesCreated.bind(this)}
            />
            <h2>Full species list ({this.state.zooSpecies.length})</h2>
            <ul>
                {this.state.zooSpecies.map(x => <SpeciesEntry species={x} key={x.id}/>)}
            </ul>
        </>
    }
}

interface SpeciesEntryProps {
    species: SpeciesData;
}
interface SpeciesEntryState {

}
class SpeciesEntry extends React.Component<SpeciesEntryProps, SpeciesEntryState> {
    render() {
        return <li>
            <span className="common_name">{this.props.species.commonName}</span>
            <span className="latin_name">{this.props.species.latinName}</span>
            <HiddenStatus hidden={this.props.species.hidden}/>
        </li>;
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const animalData = new AnimalData(getAuthCookie());
    const searchParams = new URLSearchParams(window.location.search);
    const zooId = Number(searchParams.get("id"));
    const zoo = await animalData.promiseFullZoo(zooId);
    ReactDOM.render(<ZooInfo animalData={animalData} zoo={zoo} />, document.getElementById('zoo-info'));
});
