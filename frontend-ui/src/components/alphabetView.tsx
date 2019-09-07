import * as React from "react";
import {ViewProps} from "./views";


// class AlphabetLetterResults extends React.Component<{}, {}> {
//     render() {
//         return <ul id="letter-results"></ul>
//     }
// }

class AlphabetLetter extends React.Component<{letter: string, odd: boolean, valid: boolean}, {}> {
    render() {
        const classes = `letter-list ${this.props.odd ? "odd" : "even"} ${this.props.valid? "clickable" : "disabled"}`;
        return <span className={classes}>{this.props.letter}</span>
    }
}

export class AlphabetViewComponent extends React.Component<ViewProps, {validLetters: string[]}> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {validLetters: []};
    }

    async componentDidMount(): Promise<void> {
        const validLetters = await this.props.animalData.promiseValidFirstLetters();
        this.setState({validLetters: validLetters});
    }

    render() {
        const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
        const validLetters = this.state.validLetters;
        const letters = alphabet.map((letter, index) => <AlphabetLetter key={letter} letter={letter} odd={index%2==1} valid={validLetters.includes(letter)}/>);
        return <div id="letter-list">{letters}</div>
    }
}
