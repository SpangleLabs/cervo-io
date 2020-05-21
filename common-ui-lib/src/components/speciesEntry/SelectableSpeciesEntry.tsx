import {SpeciesData} from "../../animalData";
import {SearchHilightedText} from "../searchView/SearchHilightedText";
import {LatinName} from "./LatinName";
import {TickBox} from "../TickBox";
import React from "react";
import classNames from "classnames";

const styles = require("./SelectableSpeciesEntry.css")

interface SelectableSpeciesEntryProps {
    species: SpeciesData
    selectedSpeciesIds?: number[]
    showLatinName: boolean
    onSelectSpecies?: (speciesId: number, selected?: boolean) => void
    searchTerm?: string
    odd?: boolean
}

export const SelectableSpeciesEntry: React.FunctionComponent<SelectableSpeciesEntryProps> = (props) => {

    const onSelectSpecies = props.onSelectSpecies
    const selected = props.selectedSpeciesIds != null && props.selectedSpeciesIds.includes(props.species.id);
    const className = classNames(
        styles.species,
        {
            [styles.clickable]: onSelectSpecies != null,
            [styles.selected]: selected,
            [styles.odd]: props.odd === true,
            [styles.even]: props.odd === false
        }
    )

    const onClick = onSelectSpecies != null ? () => {
        onSelectSpecies(props.species.id);
    } : undefined

    return <li className={className} onClick={onClick}>
        <span>
            {
                onSelectSpecies != null &&
                <TickBox selected={selected}/>
            }
                <span className={styles.common_name}>
                    {
                        props.searchTerm == null
                            ? props.species.commonName
                            : <SearchHilightedText
                                text={props.species.commonName}
                                searchTerm={props.searchTerm}
                            />
                    }
                </span>
            {
                props.showLatinName &&
                <LatinName>
                    {
                        props.searchTerm == null
                            ? props.species.latinName
                            : <SearchHilightedText
                                text={props.species.latinName}
                                searchTerm={props.searchTerm}
                            />
                    }
                </LatinName>
            }
            {
                props.children
            }
        </span>
    </li>
}