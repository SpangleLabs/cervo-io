import {SpeciesData} from "../../animalData";
import * as React from "react";
import {TickBox} from "../tickbox";
import {HiddenStatus} from "./admin/HiddenStatus";
import classNames from "classnames";

const styles = require("./TaxonomySpecies.css")

interface TaxonomySpeciesProps {
    species: SpeciesData;
    selected?: boolean;
    onSelect?: () => void;
    editableTaxonomy: boolean;
}
interface TaxonomySpeciesState {
}
export class TaxonomySpecies extends React.Component<TaxonomySpeciesProps, TaxonomySpeciesState> {
    constructor(props: TaxonomySpeciesProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onSelect();
    }

    render() {
        const liClassName = classNames(
            styles.species,
            {
                [styles.selected]: this.props.selected
            }
        )
        const spanClassName = classNames({[styles.clickable]: this.props.onSelect})
        const selectableTaxonomy = this.props.onSelect != null;
        return <li className={liClassName}>
            <span className={spanClassName} onClick={this.onClick}>
                <span className={styles.commonName}>{this.props.species.commonName}</span>
                <span className={styles.latinName}>{this.props.species.latinName}</span>
                {this.props.editableTaxonomy && <HiddenStatus hidden={this.props.species.hidden}/>}
                {selectableTaxonomy && <TickBox selected={this.props.selected} />}
            </span>
        </li>
    }
}
