import * as React from "react";
import {SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {ViewProps} from "@cervoio/common-ui-lib/src/views";
import {TickBox} from "@cervoio/common-ui-lib/src/components/tickbox";
import {Spinner} from "@cervoio/common-ui-lib/src/components/images";

interface SearchState {
    searchTerm: string;
    lastSearch: string;
    speciesList: SpeciesData[];
    isLoading: boolean;
}
interface SearchResultProps {
    searchTerm: string;
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
interface HilightedTextProps {
    text: string;
    searchTerm: string;
}

class SearchHilightedText extends React.Component<HilightedTextProps, {}> {
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
    constructor(props: SearchResultProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onSelectSpecies(this.props.species.id);
    }

    render() {
        const selected = this.props.selectedSpeciesIds.includes(this.props.species.id);
        const className = `clickable species ${selected ? "selected" : ""}`;
        const searchTerm = this.props.searchTerm;
        const species = this.props.species;
        return (<li>
            <span className={className} onClick={this.onClick}>
                <span className="common_name"><SearchHilightedText text={species.commonName} searchTerm={searchTerm} /></span>
                <span className="latin_name"><SearchHilightedText text={species.latinName} searchTerm={searchTerm} /></span>
                <TickBox selected={selected} />
            </span>
        </li>);
    }
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
