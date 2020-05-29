import React from "react";
import classNames from "classnames";

const styles = require("./NavTopBar.css")

interface NavTopBarProps {
    selected: NavTopBarOptions
    changePage: (page: string) => void
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
            onClick={() => props.changePage("/list-species")}
        >
            Select by species
        </div>
        <div
            className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.byZoos})}
            onClick={() => props.changePage("/list-zoos")}
        >
            List zoos
        </div>
        <div
            className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.faq})}
            onClick={() => props.changePage("/faq")}
        >
            Frequently asked questions
        </div>
    </div>
}
