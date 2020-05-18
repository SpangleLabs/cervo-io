import React from "react";
import {AnimalData, SpeciesData} from "../../animalData";
import {Spinner} from "../images/Spinner";
import {AlphabetLetterResult} from "./AlphabetLetterResult";
import {AlphabetLetter} from "./AlphabetLetter";
import {useEffect, useState} from "react";

const style = require("./AlphabetView.css")


interface AlphabetViewProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const AlphabetViewComponent: React.FunctionComponent<AlphabetViewProps> = (props) => {
    const [validLetters, setValidLetters] = useState<string[]>([])
    const [selectedLetter, setSelectedLetter] = useState("")
    const [speciesList, setSpeciesList] = useState<SpeciesData[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        props.animalData.promiseValidFirstLetters().then((validLetters) => {
            setValidLetters(validLetters)
        })
    }, [])

    const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("")
    const letters = alphabet.map(
        function (letter, index) {

            const letterClick = async () => {
                setSelectedLetter(letter)
                setIsLoading(true)
                const speciesList = await props.animalData.promiseSpeciesByLetter(letter);
                setSpeciesList(speciesList);
                setIsLoading(false);
            }

            const valid = validLetters.includes(letter);
            return <AlphabetLetter
                key={letter}
                letter={letter}
                odd={index % 2 == 1}
                valid={valid}
                selected={letter == selectedLetter}
                onClick={valid ? letterClick : null}/>
        });

    const speciesComponentList = speciesList.map(
        (species) =>
            <AlphabetLetterResult
                key={species.id}
                species={species}
                selectedSpeciesIds={props.selectedSpeciesIds}
                onSelectSpecies={props.onSelectSpecies}
            />);
    return <>
        <div id={style.letterList}>{letters}</div>
        {isLoading ? <Spinner/> : ""}
        <ul id={style.letterResults}>{speciesComponentList}</ul>
    </>
    // return <div>Hello</div>
}
