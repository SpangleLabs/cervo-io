import * as React from "react";
import {StatedTaxonomyView} from "./taxonomyView";
import {AlphabetViewComponent} from "./alphabetView/AlphabetView";
import {SearchViewComponent} from "./searchView/SearchView";
import {AnimalData} from "../animalData";

const coreStyle = require("./style.css")

interface ViewSelectorProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    selectableCategories: boolean;
    selectableSpecies: boolean;
    editableTaxonomy: boolean;
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
    onNewSpeciesCreated?: (speciesId: number) => Promise<void>;
}
enum ViewsEnum {
    Taxonomic,
    Alphabetical,
    Search
}
interface ViewSelectorState {
    currentView: ViewsEnum
}
export class ViewSelectorComponent extends React.Component<ViewSelectorProps, ViewSelectorState> {
    constructor(props: ViewSelectorProps) {
        super(props);
        this.state = {currentView: ViewsEnum.Taxonomic};
    }

    onChange(newView: ViewsEnum) {
        this.setState({currentView: newView});
    }

    render() {
        return <div id="species-selection">
            <div id="view-selector">
                Selector type:
                <label>
                    <input
                        type="radio"
                        name="selector-type"
                        value="taxonomic"
                        onChange={this.onChange.bind(this, ViewsEnum.Taxonomic)}
                        checked={this.state.currentView == ViewsEnum.Taxonomic}
                    />
                    Taxonomic
                </label>
                <label>
                    <input
                        type="radio"
                        name="selector-type"
                        value="alphabetical"
                        onChange={this.onChange.bind(this, ViewsEnum.Alphabetical)}
                        checked={this.state.currentView == ViewsEnum.Alphabetical}
                    />
                    Alphabetical
                </label>
                <label>
                    <input
                        type="radio"
                        name="selector-type"
                        value="search"
                        onChange={this.onChange.bind(this, ViewsEnum.Search)}
                        checked={this.state.currentView == ViewsEnum.Search}
                    />
                    Search
                </label>
            </div>
            <div id="animals-taxonomic"
                 className={this.state.currentView == ViewsEnum.Taxonomic ? "" : coreStyle.hidden}>
                <StatedTaxonomyView
                    animalData={this.props.animalData}
                    selectedSpecies={this.props.selectedSpeciesIds}
                    selectableCategories={this.props.selectableCategories}
                    selectableSpecies={this.props.selectableSpecies}
                    onSelectSpecies={this.props.onSelectSpecies}
                    editableTaxonomy={this.props.editableTaxonomy}
                    onNewSpeciesCreated={this.props.onNewSpeciesCreated}
                />
            </div>
            <div id="animals-alphabetic"
                 className={this.state.currentView == ViewsEnum.Alphabetical ? "" : coreStyle.hidden}>
                <AlphabetViewComponent
                    selectedSpeciesIds={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                    animalData={this.props.animalData}
                />
            </div>
            <div id="animals-search"
                 className={this.state.currentView == ViewsEnum.Search ? "" : coreStyle.hidden}>
                <SearchViewComponent
                    selectedSpeciesIds={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                    animalData={this.props.animalData}
                />
            </div>
        </div>
    }
}