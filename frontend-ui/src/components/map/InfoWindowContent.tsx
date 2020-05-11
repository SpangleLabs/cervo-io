import * as React from "react";
import {FullZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {LatinName} from "@cervoio/common-ui-lib/src/components/LatinName";

interface InfoWindowContentProps {
    zoo: FullZooJson;
    selectedSpeciesIds: number[];
}
export class InfoWindowContent extends React.Component<InfoWindowContentProps, {}> {
    render() {
        return <>
            <h1>{this.props.zoo.name}</h1>
            <a href={this.props.zoo.link}>{this.props.zoo.link}</a><br/>
            <span>Postcode: </span>{this.props.zoo.postcode}<br/>
            <h2>Species:</h2>
            <ul className="zoo_species">
                {this.props.zoo.species.map((species) =>
                    <li>
                        <span className={`zoo_species species ${this.props.selectedSpeciesIds.includes(species.species_id) ? "selected" : ""}`}>
                            <span className="common_name">{species.common_name}</span>
                            <LatinName>{species.latin_name}</LatinName>
                        </span>
                    </li>
                )}
            </ul>
        </>
    }
}
