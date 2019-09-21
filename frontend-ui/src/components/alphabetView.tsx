import * as React from "react";
import {ViewProps} from "./views";
import {SpeciesData} from "../animalData";
import {TickBox} from "./tickbox";
import {Spinner} from "@cervoio/common-ui-lib/src/components/images";

interface AlphabetLetterProps {
    letter: string,
    odd: boolean,
    valid: boolean,
    selected: boolean,
    onClick: (event: React.MouseEvent<HTMLSpanElement>) => void
}

interface AlphabetViewState {
    validLetters: string[];
    selectedLetter: string;
    speciesList: SpeciesData[];
    isLoading: boolean;
}

interface AlphabetLetterResultProps {
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

class AlphabetLetterResult extends React.Component<AlphabetLetterResultProps, {}> {
    constructor(props: AlphabetLetterResultProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onSelectSpecies(this.props.species.id);
    }

    render() {
        const selected = this.props.selectedSpeciesIds.includes(this.props.species.id);
        const className = `species clickable ${selected ? "selected" : ""}`;
        return <li>
            <span className={className} onClick={this.onClick}>
                <span className="common_name">{this.props.species.commonName}</span>
                <TickBox selected={selected} />
            </span>
        </li>
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

export class AlphabetViewComponent extends React.Component<ViewProps, AlphabetViewState> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {validLetters: [], selectedLetter: "", speciesList: [], isLoading: false};
    }

    async componentDidMount(): Promise<void> {
        const validLetters = await this.props.animalData.promiseValidFirstLetters();
        this.setState({validLetters: validLetters});
    }

    async letterClick(letter: string) {
        this.setState({selectedLetter: letter, isLoading: true});
        const speciesList = await this.props.animalData.promiseSpeciesByLetter(letter);
        this.setState({speciesList: speciesList, isLoading: false});
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
        const speciesList = this.state.speciesList.map(
            (species) =>
                <AlphabetLetterResult
                    key={species.id}
                    species={species}
                    selectedSpeciesIds={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                />);
        return <>
                <div id="letter-list">{letters}</div>
                {this.state.isLoading ? <Spinner /> : ""}
                <ul id="letter-results">{speciesList}</ul>
            </>
    }
}
