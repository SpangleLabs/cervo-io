import {getAuthCookie, toggleSelectionMembership} from "@cervoio/common-ui-lib/src/utilities";
import {StatedTaxonomyView} from "@cervoio/common-ui-lib/src/components/taxonomyView/StatedTaxonomyView";
import ReactDOM from "react-dom";
import React from "react";
import {AnimalData, SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {LoginStatus} from "./components/loginStatus";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {TickBox} from "@cervoio/common-ui-lib/src/components/TickBox";


interface BulkUpdatePageProps {
    animalData: AnimalData;
}
interface BulkUpdatePageState {
    selectedSpeciesIds: number[];
    zooList: ZooJson[];
}
class BulkUpdatePage extends React.Component<BulkUpdatePageProps, BulkUpdatePageState> {
    constructor(props: BulkUpdatePageProps) {
        super(props);
        this.state = {selectedSpeciesIds: [], zooList: []};
    }

    async componentDidMount(): Promise<void> {
        const zooList = await this.props.animalData.listZoos();
        this.setState({zooList: zooList});
    }

    onSelectSpecies(speciesId: number, selected?: boolean) {
        this.setState(function(state) {
            const newSelection = toggleSelectionMembership(state.selectedSpeciesIds, speciesId, selected);
            return {selectedSpeciesIds: newSelection}
        });
    }

    render() {
        const speciesList = this.state.selectedSpeciesIds.map(x => this.props.animalData.species.get(x));
        return <>
            <LoginStatus />
            Animals list:
            <div id="animals-taxonomic">
                <StatedTaxonomyView
                    animalData={this.props.animalData}
                    selectedSpecies={this.state.selectedSpeciesIds}
                    onSelectSpecies={this.onSelectSpecies.bind(this)}
                />
            </div>
            Update table:
            <UpdateTable
                animalData={this.props.animalData}
                selectedSpecies={speciesList}
                zooList={this.state.zooList}
            />
        </>
    }
}

interface UpdateTableProps {
    animalData: AnimalData;
    selectedSpecies: SpeciesData[];
    zooList: ZooJson[];
}
interface UpdateTableState {

}
class UpdateTable extends React.Component<UpdateTableProps, UpdateTableState> {
    render() {
        return <table>
            <UpdateTableTitleRow selectedSpecies={this.props.selectedSpecies} />
            {
                this.props.zooList.map(zoo => <UpdateTableZooRow
                    animalData={this.props.animalData}
                    zoo={zoo}
                    selectedSpecies={this.props.selectedSpecies}
                />)
            }
        </table>
    }
}

interface UpdateTableTitleRowProps {
    selectedSpecies: SpeciesData[];
}
interface UpdateTableTitleRowState {

}
class UpdateTableTitleRow extends React.Component<UpdateTableTitleRowProps, UpdateTableTitleRowState> {
    render() {
        return <thead>
        <tr>
            <td>-</td>
            {this.props.selectedSpecies.map(x =>
                <th>
                    <div className="species_name">{x.commonName}</div>
                </th>)
            }
        </tr>
        </thead>
    }
}

interface UpdateTableZooRowProps {
    animalData: AnimalData;
    zoo: ZooJson;
    selectedSpecies: SpeciesData[];
}
interface UpdateTableZooRowState {
    zooSpeciesIds: number[];
}
class UpdateTableZooRow extends React.Component<UpdateTableZooRowProps, UpdateTableZooRowState> {
    constructor(props: UpdateTableZooRowProps) {
        super(props);
        this.state = {zooSpeciesIds: []}
    }

    async componentDidMount(): Promise<void> {
        const fullZoo = await this.props.animalData.promiseFullZoo(this.props.zoo.zoo_id);
        this.setState({zooSpeciesIds: fullZoo.species.map(x => x.species_id)});
    }

    async onSelectLink(speciesId: number) {
        console.log(this.props.zoo.zoo_id + ", " + speciesId);
        if (this.state.zooSpeciesIds.includes(speciesId)) {
            await this.props.animalData.deleteZooSpeciesLink(this.props.zoo.zoo_id, speciesId);
            this.setState({zooSpeciesIds: this.state.zooSpeciesIds.filter(x => x != speciesId)});
        } else {
            await this.props.animalData.addZooSpeciesLink(this.props.zoo.zoo_id, speciesId);
            this.setState({zooSpeciesIds: this.state.zooSpeciesIds.concat([speciesId])});
        }
    }

    render() {
        return <tr>
            <td><a href={`view_zoo.html?id=${this.props.zoo.zoo_id}`}>{this.props.zoo.name}</a></td>
            {
                this.props.selectedSpecies.map(species =>
                {
                    const inZoo = this.state.zooSpeciesIds.includes(species.id);
                    return <ZooSpeciesLinkCheckbox
                        zoo={this.props.zoo}
                        species={species}
                        checked={inZoo}
                        onClick={this.onSelectLink.bind(this, species.id)}
                    />
                })
            }
        </tr>
    }
}

interface ZooSpeciesLinkCheckboxProps {
    zoo: ZooJson;
    species: SpeciesData;
    checked: boolean;
    onClick: () => Promise<void>;
}
interface ZooSpeciesLinkCheckboxState {
}
class ZooSpeciesLinkCheckbox extends React.Component<ZooSpeciesLinkCheckboxProps, ZooSpeciesLinkCheckboxState> {
    render() {
        return <td onClick={this.props.onClick}>
            <TickBox selected={this.props.checked} />
        </td>
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const animalData = new AnimalData(getAuthCookie());
    ReactDOM.render(<BulkUpdatePage
        animalData={animalData}
    />, document.getElementById('bulk-update'));
});
