import React, {useState} from "react";
import {AlphabetViewComponent} from "./alphabetView/AlphabetView";
import {SearchViewComponent} from "./searchView/SearchView";
import {AnimalData} from "../animalData";
import {StatedTaxonomyView} from "./taxonomyView/StatedTaxonomyView";
import classNames from "classnames";

const styles = require("./ViewSelector.css")

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


export const ViewSelectorComponent: React.FunctionComponent<ViewSelectorProps> = (props) => {
    const [currentView, setCurrentView] = useState(ViewsEnum.Taxonomic)

    const onChange = (newView: ViewsEnum) => {
        setCurrentView(newView)
    }

    return <div>
        <div className={styles.selector_type}>
            <div
                className={classNames(styles.option, styles.clickable, {[styles.selected]: currentView == ViewsEnum.Taxonomic})}
                onClick={() => onChange(ViewsEnum.Taxonomic)}
            >
                Taxonomy
            </div>
            <div
                className={classNames(styles.option, styles.clickable, {[styles.selected]: currentView == ViewsEnum.Alphabetical})}
                onClick={() => onChange(ViewsEnum.Alphabetical)}
            >
                Alphabet
            </div>
            <div
                className={classNames(styles.option, styles.clickable, {[styles.selected]: currentView == ViewsEnum.Search})}
                onClick={() => onChange(ViewsEnum.Search)}
            >
                Search
            </div>
        </div>
        <div id="animals-taxonomic"
             className={currentView == ViewsEnum.Taxonomic ? "" : styles.hidden}>
            <StatedTaxonomyView
                animalData={props.animalData}
                selectedSpecies={props.selectedSpeciesIds}
                selectableCategories={props.selectableCategories}
                selectableSpecies={props.selectableSpecies}
                onSelectSpecies={props.onSelectSpecies}
                editableTaxonomy={props.editableTaxonomy}
                onNewSpeciesCreated={props.onNewSpeciesCreated}
            />
        </div>
        <div id="animals-alphabetic"
             className={currentView == ViewsEnum.Alphabetical ? "" : styles.hidden}>
            <AlphabetViewComponent
                selectedSpeciesIds={props.selectedSpeciesIds}
                onSelectSpecies={props.onSelectSpecies}
                animalData={props.animalData}
            />
        </div>
        <div id="animals-search"
             className={currentView == ViewsEnum.Search ? "" : styles.hidden}>
            <SearchViewComponent
                selectedSpeciesIds={props.selectedSpeciesIds}
                onSelectSpecies={props.onSelectSpecies}
                animalData={props.animalData}
            />
        </div>
    </div>
}