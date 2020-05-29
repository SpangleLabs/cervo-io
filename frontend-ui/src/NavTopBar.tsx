import React from "react";
import classNames from "classnames";

const styles = require("./NavTopBar.css")

interface NavTopBarProps {
    selected: NavTopBarOptions
    history: History
}

export enum NavTopBarOptions {
    bySpecies,
    byZoos,
    faq
}

export const NavTopBar: React.FunctionComponent<NavTopBarProps> = (props) => {
    return <div className={styles.navBar}>
        <div
            className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.bySpecies})}
            onClick={() => props.history.push("/list-species")}
        >
            Select by species
        </div>
        <div
            className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.byZoos})}
            onClick={() => props.history.push("/list-zoos")}
        >
            List zoos
        </div>
        <div
            className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.faq})}
            onClick={() => props.history.push("/faq")}
        >
            Frequently asked questions
        </div>
    </div>
}
