import React from "react";
import {FullZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {LatinName} from "@cervoio/common-ui-lib/src/components/LatinName";
import classNames from "classnames";

const styles = require("./InfoWindowContent.css")

interface InfoWindowContentProps {
    zoo: FullZooJson;
    selectedSpeciesIds: number[];
}

export const InfoWindowContent: React.FunctionComponent<InfoWindowContentProps> = (props) => {
    return <>
        <h1>{props.zoo.name}</h1>
        <a href={props.zoo.link}>{props.zoo.link}</a><br/>
        <span>Postcode: </span>{props.zoo.postcode}<br/>
        <h2>Species:</h2>
        <ul className={styles.zoo_species}>
            {props.zoo.species.map((species) => {
                    const classes = classNames(
                        styles.zoo_species,
                        styles.species,
                        {
                            [styles.selected]: props.selectedSpeciesIds.includes(species.species_id)
                        }
                    )
                    return <li key={species.species_id}>
                        <span className={classes}>
                            <span>{species.common_name}</span>
                            <LatinName>{species.latin_name}</LatinName>
                        </span>
                    </li>
                }
            )}
        </ul>
    </>
}
