import React from "react";
import classNames from "classnames";

const styles = require("./AlphabetLetter.css")

interface AlphabetLetterProps {
    letter: string,
    odd: boolean,
    valid: boolean,
    selected: boolean,
    onClick: ((e: React.MouseEvent<HTMLSpanElement>) => void) | null
}

export const AlphabetLetter: React.FunctionComponent<AlphabetLetterProps> = (props) => {
    const classes = classNames(
        styles.letterList,
        {
            [styles.odd]: props.odd,
            [styles.even]: !props.odd,
            [styles.clickable]: props.valid,
            [styles.disabled]: !props.valid,
            [styles.selected]: props.selected
        }
    )
    return <span className={classes} onClick={props.onClick  ? props.onClick : undefined}>{props.letter}</span>
}
