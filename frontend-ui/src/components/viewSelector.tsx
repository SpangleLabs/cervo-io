import {ViewProps} from "@cervoio/common-ui-lib/src/views";
import * as React from "react";
import {StatedTaxonomyView} from "@cervoio/common-ui-lib/src/components/taxonomyView";
import {AlphabetViewComponent} from "./alphabetView";
import {SearchViewComponent} from "./searchView";

enum ViewsEnum {
    Taxonomic,
    Alphabetical,
    Search
}
interface ViewSelectorState {
    currentView: ViewsEnum
}

export class ViewSelectorComponent extends React.Component<ViewProps, ViewSelectorState> {
    constructor(props: ViewProps) {
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
                 className={this.state.currentView == ViewsEnum.Taxonomic ? "" : "hidden"}>
                <StatedTaxonomyView
                    selectedSpecies={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                    animalData={this.props.animalData}
                />
            </div>
            <div id="animals-alphabetic"
                 className={this.state.currentView == ViewsEnum.Alphabetical ? "" : "hidden"}>
                <AlphabetViewComponent
                    selectedSpeciesIds={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                    animalData={this.props.animalData}
                />
            </div>
            <div id="animals-search"
                 className={this.state.currentView == ViewsEnum.Search ? "" : "hidden"}>
                <SearchViewComponent
                    selectedSpeciesIds={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                    animalData={this.props.animalData}
                />
            </div>
        </div>
    }
}