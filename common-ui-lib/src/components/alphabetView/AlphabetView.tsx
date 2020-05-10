import * as React from "react";
import {AnimalData, SpeciesData} from "../../animalData";
import {Spinner} from "../images";
import {AlphabetLetterResult} from "./AlphabetLetterResult";
import {AlphabetLetter} from "./AlphabetLetter";

const style = require("./AlphabetView.css")


interface AlphabetViewProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
interface AlphabetViewState {
    validLetters: string[];
    selectedLetter: string;
    speciesList: SpeciesData[];
    isLoading: boolean;
}
export class AlphabetViewComponent extends React.Component<AlphabetViewProps, AlphabetViewState> {
    constructor(props: AlphabetViewProps) {
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
                <div id={style.letterList}>{letters}</div>
                {this.state.isLoading ? <Spinner /> : ""}
                <ul id={style.letterResults}>{speciesList}</ul>
            </>
    }
}
