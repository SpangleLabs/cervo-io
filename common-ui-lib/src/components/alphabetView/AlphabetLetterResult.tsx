import {SpeciesData} from "../../animalData";
import React from "react";
import classNames from "classnames";
import {TickBox} from "../TickBox";

const style = require("./AlphabetLetterResult.css")

interface AlphabetLetterResultProps {
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const AlphabetLetterResult: React.FunctionComponent<AlphabetLetterResultProps> = (props) => {
    const onClick = () => {
        props.onSelectSpecies(props.species.id)
    }

    const selected = props.selectedSpeciesIds.includes(props.species.id);
    const className = classNames(
        style.species,
        style.clickable,
        {[style.selected]: selected}
    )
    return <li>
            <span className={className} onClick={onClick}>
                <span className={style.common_name}>{props.species.commonName}</span>
                <TickBox selected={selected}/>
            </span>
    </li>
}
