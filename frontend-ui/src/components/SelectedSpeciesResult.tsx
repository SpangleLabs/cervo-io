import * as React from "react";
import {TickBox} from "@cervoio/common-ui-lib/src/components/TickBox";
import {SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {LatinName} from "@cervoio/common-ui-lib/src/components/LatinName";
import classNames from "classnames";

const styles = require("./SelectedSpeciesResult.css")

interface SelectedSpeciesResultProps {
    species: SpeciesData;
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
export class SelectedSpeciesResult extends React.Component<SelectedSpeciesResultProps, {}> {
    constructor(props: SelectedSpeciesResultProps) {
        super(props);
    }

    render() {
        const onClick = this.props.onSelectSpecies.bind(null, this.props.species.id, false);
        return <li>
            <span className={classNames(styles.species, styles.clickable, styles.selected)} onClick={onClick}>
                <span>{this.props.species.commonName}</span>
                <LatinName>{this.props.species.latinName}</LatinName>
                <TickBox selected={true} />
            </span>
        </li>
    }
}
