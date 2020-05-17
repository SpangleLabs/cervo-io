import * as React from "react";
import {SearchHilightedText} from "./SearchHilightedText";
import {TickBox} from "../TickBox";
import {SpeciesData} from "../../animalData";
import classNames from "classnames";
import {LatinName} from "../LatinName";

const styles = require("./SearchResult.css")

interface SearchResultProps {
    searchTerm: string;
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const SearchResult: React.FunctionComponent<SearchResultProps> = (props) => {
    const onClick = () => {
        props.onSelectSpecies(props.species.id);
    }
    const selected = props.selectedSpeciesIds.includes(props.species.id);
    const className = classNames(
        styles.clickable,
        styles.species,
        {
            [styles.selected]: selected
        }
    )
    const searchTerm = props.searchTerm;
    const species = props.species;
    return <li>
            <span className={className} onClick={onClick}>
                <span className={styles.common_name}>
                    <SearchHilightedText
                        text={species.commonName}
                        searchTerm={searchTerm}
                    />
                </span>
                <LatinName>
                    <SearchHilightedText
                        text={species.latinName}
                        searchTerm={searchTerm}
                    />
                </LatinName>
                <TickBox selected={selected}/>
            </span>
    </li>
}