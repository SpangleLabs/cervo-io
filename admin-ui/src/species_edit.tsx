import {getAuthCookie} from "./lib/authCheck";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {StatedTaxonomyView} from "@cervoio/common-ui-lib/src/components/taxonomyView";
import {AnimalData} from "@cervoio/common-ui-lib/src/animalData";
import {LoginStatus} from "./components/loginStatus";
import {ZooJson} from "../../common-lib/src/apiInterfaces";
import {ChangeEvent} from "react";

interface SpeciesEditorPageProps {
    animalData: AnimalData;
}
interface SpeciesEditorPageState {
    zooList: ZooJson[];
    selectedZoo: number;
}
class SpeciesEditorPage extends React.Component<SpeciesEditorPageProps, SpeciesEditorPageState> {
    constructor(props: SpeciesEditorPageProps) {
        super(props);
        this.state = {zooList: [], selectedZoo: 0};
    }

    async componentDidMount(): Promise<void> {
        const zooList = await this.props.animalData.listZoos();
        this.setState({zooList: zooList});
    }

    onChangeZoo(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({selectedZoo: Number(event.target.value)});
    }

    async newSpeciesCreated(speciesId: number): Promise<void> {
        if(this.state.selectedZoo != 0) {
            await this.props.animalData.addZooSpeciesLink(this.state.selectedZoo, speciesId);
        }
    }

    render() {
        return <>
            <LoginStatus />
            <ZooSelector
                zooList={this.state.zooList}
                selectedZoo={this.state.selectedZoo}
                onChangeZoo={this.onChangeZoo.bind(this)}
            />
            <div id="animals-taxonomic">
                <StatedTaxonomyView
                    selectedSpecies={[]}
                    onSelectSpecies={null}
                    animalData={this.props.animalData}
                    editableTaxonomy={true}
                    newSpeciesCreated={this.newSpeciesCreated.bind(this)}
                />
            </div>
        </>
    }
}

interface ZooSelectorProps {
    zooList: ZooJson[];
    selectedZoo: number;
    onChangeZoo: (event: ChangeEvent<HTMLSelectElement>) => void;
}
interface ZooSelectorState {

}
class ZooSelector extends React.Component<ZooSelectorProps, ZooSelectorState> {
    render() {
        return <>
            Automatically add new species to zoo:
            <select value={this.props.selectedZoo} onChange={this.props.onChangeZoo}>
                <option value={0}>-- Do not add to zoo --</option>
                {this.props.zooList.map(x => <option value={x.zoo_id}>{x.name}</option>)}
            </select>
        </>
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const animalData = new AnimalData(getAuthCookie());
    ReactDOM.render(<SpeciesEditorPage
        animalData={animalData}
    />, document.getElementById('species-editor'));
});
