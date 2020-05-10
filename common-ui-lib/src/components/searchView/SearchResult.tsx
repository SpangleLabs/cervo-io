import * as React from "react";
import {SearchHilightedText} from "./SearchHilightedText";
import {TickBox} from "../tickbox";
import {SpeciesData} from "../../animalData";
import classNames from "classnames";

const styles = require("./SearchResult.css")

interface SearchResultProps {
    searchTerm: string;
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export class SearchResult extends React.Component<SearchResultProps, {}> {
    constructor(props: SearchResultProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onSelectSpecies(this.props.species.id);
    }

    render() {
        const selected = this.props.selectedSpeciesIds.includes(this.props.species.id);
        const className = classNames(
            styles.clickable,
            styles.species,
            {
                [styles.selected]: selected
            }
        )
        const searchTerm = this.props.searchTerm;
        const species = this.props.species;
        return (<li>
            <span className={className} onClick={this.onClick}>
                <span className={styles.common_name}>
                    <SearchHilightedText
                        text={species.commonName}
                        searchTerm={searchTerm}
                    />
                </span>
                <span className={styles.latin_name}>
                    <SearchHilightedText
                        text={species.latinName}
                        searchTerm={searchTerm}
                    />
                </span>
                <TickBox selected={selected}/>
            </span>
        </li>);
    }
}