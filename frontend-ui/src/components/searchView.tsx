import * as React from "react";
import {AnimalData, SpeciesData} from "../animalData";

interface View {
    animalData: AnimalData
}
interface SearchState {
    searchTerm: string;
    lastSearch: string;
    speciesList: SpeciesData[];
}
interface SearchResultProps {
    searchTerm: string,
    species: SpeciesData
}

class SearchHilightedText extends React.Component<{text: string, searchTerm: string}, {}> {
    render() {
        const searchRegex = new RegExp(this.props.searchTerm, "gi");
        this.props.text.split(searchRegex);

        let split = this.props.text.split(searchRegex);
        let replacements = this.props.text.match(searchRegex);
        let result = [];
        for (let i = 0; i < split.length - 1; i++) {
            result.push(split[i]);
            result.push(<span className='search_term'>{replacements[i]}</span>);
        }
        result.push(split[split.length - 1]);
        return result;
    }
}

class SearchResult extends React.Component<SearchResultProps, {}> {
    render() {
        const searchTerm = this.props.searchTerm;
        const species = this.props.species;
        return (<li>
            <span className="common_name"><SearchHilightedText text={species.commonName} searchTerm={searchTerm} /></span>
            <span className="latin_name"><SearchHilightedText text={species.latinName} searchTerm={searchTerm} /></span>
        </li>);
    }
}

export class SearchViewComponent extends React.Component<View, SearchState> {
    constructor(props: View) {
        super(props);
        this.state = {searchTerm: "", lastSearch: "", speciesList: []};
        this.onUpdate = this.onUpdate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onUpdate(e: React.FormEvent<HTMLInputElement>) {
        e.preventDefault();
        this.setState({searchTerm: e.currentTarget.value})
    }

    async onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const lastSearch = this.state.searchTerm;
        this.setState(function(state) {
            return {
                lastSearch: lastSearch
            }
        });
        const species = await this.props.animalData.promiseSearchSpecies(lastSearch);
        this.setState({speciesList: species});
    }

    render() {
        const speciesElements = this.state.speciesList.map(
            (species) => <SearchResult key={species.id} species={species} searchTerm={this.state.lastSearch} />
            );
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <label>
                        Search:
                        <input type="text" value={this.state.searchTerm} onChange={this.onUpdate}/>
                    </label>
                    <input type="submit"/>
                </form>
                <ul>
                    {speciesElements}
                </ul>
            </div>
        )
    }
}
