import $ from "jquery";
import {spinner} from "./utilities";
import {View} from "./views";
import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";


/**
 * Create and store list of AlphabetLetter objects
 */
export class AlphabetView extends View {
    letters: {[key: string]: AlphabetLetter};
    updating: boolean;
    latestLetter: string | null;

    constructor(animalData: AnimalData, selection: SelectedSpecies, validLetters: string[]) {
        super($("#animals-alphabetic"), animalData, selection);
        this.letters = {};
        let odd = true;
        for (const letter of "abcdefghijklmnopqrstuvwxyz") {
            this.letters[letter] = new AlphabetLetter(this, letter, odd);
            odd = !odd;
        }
        // Whether it is currently updating, for debouncing
        this.updating = false;
        // Latest letter loaded, for debouncing
        this.latestLetter = null;
        // Get the list of valid first letters, and update the invalid ones.
        for (const letter in this.letters) {
            if (!validLetters.includes(letter.toUpperCase())) {
                this.letters[letter].disable();
            }
        }
    }
}

/**
 * Get list of species matching letter, display/hide them.
 */
class AlphabetLetter {
    letter: string;
    alphabetView: AlphabetView;
    rootElem: JQuery<HTMLElement>;
    letterListElem: JQuery<HTMLElement>;
    letterResultsElem: JQuery<HTMLElement>;
    letterElem: JQuery<HTMLElement>;
    animals: SpeciesJson[] | null;

    constructor(alphabetView: AlphabetView, letter: string, odd: boolean) {
        this.letter = letter;
        this.alphabetView = alphabetView;
        this.rootElem = alphabetView.rootElem;
        this.letterListElem = $("#letter-list");
        this.letterResultsElem = $("ul#letter-results");
        this.letterListElem.append(`<span id='letter-list-${letter}' class='letter-list ${odd ? "odd" : "even"}'>${letter.toUpperCase()}</span>`);
        this.letterElem = $(`#letter-list-${letter}`);
        this.letterElem.click($.proxy(this.userClick, this));
        // Cache of animal list for this letter
        this.animals = null;
    }

    userClick() {
        if(this.alphabetView.updating) {
            this.alphabetView.latestLetter = this.letter;
            return;
        }
        this.alphabetView.updating = true;
        this.alphabetView.latestLetter = this.letter;
        this.letterResultsElem.empty();
        this.alphabetView.rootElem.find(".letter-list").removeClass("selected");
        this.letterElem.addClass("selected");
        const self = this;
        this.rootElem.append(spinner);
        if(this.animals == null) {
            this.alphabetView.animalData.promiseSpeciesByLetter(this.letter).then(function(animals: SpeciesJson[]) {
                self.animals = animals;
                self.renderList(animals);
                self.alphabetView.updating = false;
                if(self.alphabetView.latestLetter && self.alphabetView.latestLetter !== self.letter) {
                    self.alphabetView.letters[self.alphabetView.latestLetter].userClick();
                }
            });
        } else {
            this.renderList(this.animals);
            this.alphabetView.updating = false;
            if(self.alphabetView.latestLetter && self.alphabetView.latestLetter !== self.letter) {
                self.alphabetView.letters[self.alphabetView.latestLetter].userClick();
            }
        }
    }

    renderList(animals: SpeciesJson[]) {
        for (const animal of animals) {
            const species = this.alphabetView.animalData.getOrCreateSpecies(animal);
            const speciesClass = `species-${species.id}`;
            const selected = this.alphabetView.selection.containsSpecies(species.id);
            this.letterResultsElem.append(`<li class="${speciesClass}">
                    <span class='selector' onclick='userSelectSpecies(${species.id})'>
                    ${species.commonName}
                        <img src="images/box_${selected ? "checked" : "unchecked"}.svg" alt="${selected ? "✔" : "➕"}️"/>
                    </span></li>`);
            const self = this;
            this.letterElem.find(`.${speciesClass}.selector`).click(
                function() {
                    self.alphabetView.selection.toggleSpecies(species.id);
                }
                );
        }
        this.rootElem.find("img.spinner").remove();
    }

    disable() {
        this.letterElem.addClass("disabled");
        this.letterElem.off();
    }
}