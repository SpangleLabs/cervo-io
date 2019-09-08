import * as React from "react";
import {ViewProps} from "./views";
import {SpeciesData} from "../animalData";

interface AlphabetLetterProps {
    letter: string,
    odd: boolean,
    valid: boolean,
    selected: boolean,
    onClick: (event: React.MouseEvent<HTMLSpanElement>) => void
}

class AlphabetLetterResults extends React.Component<{speciesList: SpeciesData[]}, {}> {
    render() {
        const speciesList = this.props.speciesList.map((species) => <li>{species.commonName}</li>);
        return <ul id="letter-results">{speciesList}</ul>
    }
}

class AlphabetLetter extends React.Component<AlphabetLetterProps, {}> {
    constructor(props: AlphabetLetterProps) {
        super(props);
    }

    render() {
        const classes = `letter-list ${this.props.odd ? "odd" : "even"} ${this.props.valid? "clickable" : "disabled"} ${this.props.selected ? "selected" : ""}`;
        return <span className={classes} onClick={this.props.onClick}>{this.props.letter}</span>
    }
}

export class AlphabetViewComponent extends React.Component<ViewProps, {validLetters: string[], selectedLetter: string, speciesList: SpeciesData[]}> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {validLetters: [], selectedLetter: "", speciesList: []};
    }

    async componentDidMount(): Promise<void> {
        const validLetters = await this.props.animalData.promiseValidFirstLetters();
        this.setState({validLetters: validLetters});
    }

    async letterClick(letter: string) {
        this.setState({selectedLetter: letter});
        const speciesList = await this.props.animalData.promiseSpeciesByLetter(letter);
        this.setState({speciesList: speciesList});
    }

    render() {
        const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
        const validLetters = this.state.validLetters;
        const self = this;
        const letters = alphabet.map(
            function (letter, index) {
                const letterClick = self.letterClick.bind(self, letter);
                const valid = validLetters.includes(letter);
                return <AlphabetLetter
                    key={letter}
                    letter={letter}
                    odd={index % 2 == 1}
                    valid={valid}
                    selected={letter == self.state.selectedLetter}
                    onClick={valid ? letterClick : null}/>
            });
        return <>
                <div id="letter-list">{letters}</div>
                <AlphabetLetterResults speciesList={this.state.speciesList} />
            </>
    }
}
