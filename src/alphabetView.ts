import $ from "jquery";
import {promiseSpinner, tickboxImageElem} from "./utilities";
import {View} from "./views";
import {AnimalData, SpeciesData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";


/**
 * Create and store list of AlphabetLetter objects
 */
export class AlphabetView extends View {
    letters: Map<string, AlphabetLetter>;
    updating: boolean;
    latestLetter: string | null;

    constructor(animalData: AnimalData, selection: SelectedSpecies, validLetters: string[]) {
        super($("#animals-alphabetic"), animalData, selection);
        this.letters = new Map<string, AlphabetLetter>();
        let odd = true;
        for (const letter of "abcdefghijklmnopqrstuvwxyz") {
            this.letters.set(letter, new AlphabetLetter(this, letter, odd));
            odd = !odd;
        }
        // Whether it is currently updating, for debouncing
        this.updating = false;
        // Latest letter loaded, for debouncing
        this.latestLetter = null;
        // Get the list of valid first letters, and update the invalid ones.
        for (const letter of this.letters.keys()) {
            if (!validLetters.includes(letter.toUpperCase())) {
                this.letters.get(letter).disable();
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
    animals: SpeciesData[] | null;

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

    userClick(): Promise<void> {
        // Debounce
        if(this.alphabetView.updating) {
            this.alphabetView.latestLetter = this.letter;
            return Promise.resolve();
        }
        this.alphabetView.updating = true;
        this.alphabetView.latestLetter = this.letter;
        this.letterResultsElem.empty();
        this.alphabetView.rootElem.find(".letter-list").removeClass("selected");
        this.letterElem.addClass("selected");
        const self = this;
        // Promise getting the animal list if you don't have it
        let promiseGetAnimals = Promise.resolve();
        if(!this.animals) {
            promiseGetAnimals = this.alphabetView.animalData.promiseSpeciesByLetter(this.letter).then(function(animals: SpeciesData[]) {
                self.animals = animals;
            });
        }
        // Render animal list
        const promiseRenderAnimals = promiseGetAnimals.then(function() {
            self.renderList(self.animals);
        });
        // Wrap render with spinner, then debounce
        return promiseSpinner(this.rootElem, promiseRenderAnimals).then(function() {
            self.alphabetView.updating = false;
            if(self.alphabetView.latestLetter && self.alphabetView.latestLetter !== self.letter) {
                self.alphabetView.letters.get(self.alphabetView.latestLetter).userClick();
            }
        });
    }

    renderList(animals: SpeciesData[]) {
        for (const species of animals) {
            const speciesClass = `species-${species.id}`;
            const selected = this.alphabetView.selection.containsSpecies(species.id);
            const li = $("<li />").addClass(speciesClass);
            const selector = $("<span />").addClass("selector").addClass("clickable").text(species.commonName)
                .on("click", () => this.alphabetView.selection.toggleSpecies(species.id));
            const img = tickboxImageElem(selected);
            selector.append(img);
            li.append(selector).appendTo(this.letterResultsElem);
            const self = this;
            this.letterElem.find(`.${speciesClass}.selector`).click(
                function() {
                    self.alphabetView.selection.toggleSpecies(species.id);
                }
                );
        }
    }

    disable() {
        this.letterElem.addClass("disabled");
        this.letterElem.off();
    }
}