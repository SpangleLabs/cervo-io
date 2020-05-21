import {SpeciesData} from "../../animalData";
import React from "react";
import {TickBox} from "../TickBox";
import {HiddenStatus} from "./admin/HiddenStatus";
import classNames from "classnames";
import {LatinName} from "../speciesEntry/LatinName";

const styles = require("./TaxonomySpecies.css")

interface TaxonomySpeciesProps {
    species: SpeciesData;
    selected?: boolean;
    onSelect?: () => void;
    editableTaxonomy: boolean;
    odd: boolean;
}

export const TaxonomySpecies: React.FunctionComponent<TaxonomySpeciesProps> = (props) => {
    const onClick = () => {
        props.onSelect();
    }
    const liClassName = classNames(
        styles.species,
        {
            [styles.selected]: props.selected,
            [styles.odd]: props.odd,
            [styles.even]: !props.odd
        }
    )
    const spanClassName = classNames({[styles.clickable]: props.onSelect})
    const selectableTaxonomy = props.onSelect != null;
    return <li className={liClassName}>
            <span className={spanClassName} onClick={onClick}>
                <span className={styles.commonName}>{props.species.commonName}</span>
                <LatinName>{props.species.latinName}</LatinName>
                {props.editableTaxonomy && <HiddenStatus hidden={props.species.hidden}/>}
                {selectableTaxonomy && <TickBox selected={props.selected}/>}
            </span>
    </li>
}
