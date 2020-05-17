import React from "react";
import {SpeciesData} from "../../animalData";
import {ViewProps} from "../../views";
import {Spinner} from "../images/Spinner";
import {SearchResult} from "./SearchResult";

interface SearchState {
    searchTerm: string;
    lastSearch: string;
    speciesList: SpeciesData[];
    isLoading: boolean;
}

export class SearchViewComponent extends React.Component<ViewProps, SearchState> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {searchTerm: "", lastSearch: "", speciesList: [], isLoading: false};
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
                lastSearch: state.searchTerm,
                isLoading: true
            }
        });
        const species = await this.props.animalData.promiseSearchSpecies(lastSearch);
        this.setState({speciesList: species, isLoading: false});
    }

    render() {
        const speciesElements = this.state.speciesList.map(
            (species) =>
                <SearchResult
                    key={species.id}
                    species={species}
                    searchTerm={this.state.lastSearch}
                    selectedSpeciesIds={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                />
            );
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <label>
                        Search:
                        <input type="text" value={this.state.searchTerm} onChange={this.onUpdate}/>
                    </label>
                    <input type="submit"/>
                    {this.state.isLoading ? <Spinner /> : ""}
                </form>
                <ul>
                    {speciesElements}
                </ul>
            </div>
        )
    }
}
