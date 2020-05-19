import React from "react";
import {TickBox} from "@cervoio/common-ui-lib/src/components/TickBox";
import {SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {LatinName} from "@cervoio/common-ui-lib/src/components/LatinName";
import classNames from "classnames";

const styles = require("./SelectedSpeciesResult.css")

interface SelectedSpeciesResultProps {
    species: SpeciesData;
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const SelectedSpeciesResult: React.FunctionComponent<SelectedSpeciesResultProps> = (props) => {
    const onClick = props.onSelectSpecies.bind(null, props.species.id, false);
    return <li>
            <span className={classNames(styles.species, styles.clickable, styles.selected)} onClick={onClick}>
                <span>{props.species.commonName}</span>
                <LatinName>{props.species.latinName}</LatinName>
                <TickBox selected={true}/>
            </span>
    </li>
}
