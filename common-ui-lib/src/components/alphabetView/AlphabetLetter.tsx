import * as React from "react";
import classNames from "classnames";

const styles = require("./AlphabetLetter.css")

interface AlphabetLetterProps {
    letter: string,
    odd: boolean,
    valid: boolean,
    selected: boolean,
    onClick: (event: React.MouseEvent<HTMLSpanElement>) => void
}
export class AlphabetLetter extends React.Component<AlphabetLetterProps, {}> {
    constructor(props: AlphabetLetterProps) {
        super(props);
    }

    render() {
        const classes = classNames(
            styles.letterList,
            {
                [styles.odd]: this.props.odd,
                [styles.even]: !this.props.odd,
                [styles.clickable]: this.props.valid,
                [styles.disabled]: !this.props.valid,
                [styles.selected]: this.props.selected
            }
        )
        return <span className={classes} onClick={this.props.onClick}>{this.props.letter}</span>
    }
}
