import React from "react";
import classNames from "classnames";

const styles = require("./NavTopBar.css")

interface NavTopBarProps {
    selected: NavTopBarOptions
}

export enum NavTopBarOptions {
    bySpecies,
    byZoos,
    faq
}

export const NavTopBar: React.FunctionComponent<NavTopBarProps> = (props) => {
    return <div className={styles.navBar}>|
        <div className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.bySpecies})}>
            Select by species
        </div>
        <div className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.byZoos})}>
            <abbr title="Coming soon">List zoos</abbr>
        </div>
        <div className={classNames(styles.navButton, {[styles.selected]: props.selected==NavTopBarOptions.faq})}>
            <a href="faq.html">Frequently asked questions, privacy policy, and terms & conditions</a>
        </div>
    </div>
}
