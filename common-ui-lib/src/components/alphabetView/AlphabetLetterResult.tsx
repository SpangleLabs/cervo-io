import {SpeciesData} from "../../animalData";
import * as React from "react";
import classNames from "classnames";
import {TickBox} from "../tickbox";

const style = require("./AlphabetLetterResult.css")

interface AlphabetLetterResultProps {
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
export class AlphabetLetterResult extends React.Component<AlphabetLetterResultProps, {}> {
    constructor(props: AlphabetLetterResultProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onSelectSpecies(this.props.species.id);
    }

    render() {
        const selected = this.props.selectedSpeciesIds.includes(this.props.species.id);
        const className = classNames(
            style.species,
            style.clickable,
            {[style.selected]: selected}
        )
        return <li>
            <span className={className} onClick={this.onClick}>
                <span className={style.common_name}>{this.props.species.commonName}</span>
                <TickBox selected={selected} />
            </span>
        </li>
    }
}
