import * as React from "react";
import {ViewProps} from "./views";
import {CategoryData, SpeciesData} from "../animalData";
import {TickBox} from "./tickbox";
import {CategoryLevelJson} from "../../../common-lib/src/apiInterfaces";


interface TaxonomyViewState {
    baseCategories: CategoryData[];
    categoryLevels: CategoryLevelJson[];
}
interface CategoryProps extends ViewProps {
    category: CategoryData;
    categoryLevels: CategoryLevelJson[];
    autoExpand: boolean;
    odd: boolean;
    selectedSpecies: number[];
    onSelectSpecies: (speciesId: number) => void
}
interface CategoryState {
    expand: boolean,
    selected: boolean,
    gotFullData: boolean,
    subCategories: CategoryData[],
    species: SpeciesData[]
}
interface SpeciesProps {
    species: SpeciesData;
    selected: boolean;
    onSelect: () => void
}
interface SpeciesState {
}


class TaxonomySpecies extends React.Component<SpeciesProps, SpeciesState> {
    constructor(props: SpeciesProps) {
        super(props);
    }

    render() {
        const className = `species ${this.props.selected ? "selected" : ""}`;
        return <li className={className}>
            <span className="clickable" onClick={this.props.onSelect}>
                <span className="species_name">{this.props.species.commonName}</span>
                <span className="latin_name">{this.props.species.latinName}</span>
                <TickBox selected={this.props.selected} />
            </span>
        </li>
    }
}

class TaxonomyCategory extends React.Component<CategoryProps, CategoryState> {
    constructor(props: CategoryProps) {
        super(props);
        this.state = {expand: false, selected: false, gotFullData: false, subCategories: [], species: []};
        this.expand = this.expand.bind(this);
        this.selectCategory = this.selectCategory.bind(this);
    }

    async componentDidMount() {
        if(this.props.autoExpand) {
            this.expand();
        }
    }

    categoryLevelName() {
        const matching = this.props.categoryLevels.filter((level) => level.category_level_id == this.props.category.categoryLevelId);
        if(matching.length) {
            return matching[0].name;
        } else {
            return "(unknown rank)";
        }
    }

    async populate() {
        if (!this.state.gotFullData) {
            const [subCategories, species] = await Promise.all([this.props.category.getSubCategories(), this.props.category.getSpecies()]);
            this.setState({gotFullData: true, subCategories: subCategories, species: species});
        }
    }

    async expand() {
        await this.populate();
        this.setState((state) => {return {expand: !state.expand}});
        console.log("Expand me " + this.props.category.name);
    }

    selectCategory() {
        console.log("Select me " + this.props.category.name);
    }

    render() {
        const liClassName = `category ${this.state.expand ? "open" : "closed"}`;
        const ulClassName = `${this.props.odd ? "even" : "odd"} ${this.state.expand ? "" : "hidden"}`;
        return <li className={liClassName}>
            <span className="clickable" onClick={this.expand}>
                <span className="category_name">{this.props.category.name}</span>
                <span className="category_level">{this.categoryLevelName()}</span>
            </span>
            <span className="clickable selector" onClick={this.selectCategory}>
                <TickBox selected={this.state.selected} />
            </span>
            <ul className={ulClassName}>
                {this.state.subCategories.map(
                    (category) =>
                        <TaxonomyCategory
                            category={category}
                            categoryLevels={this.props.categoryLevels}
                            animalData={this.props.animalData}
                            selection={this.props.selection}
                            odd={!this.props.odd}
                            autoExpand={this.state.subCategories.length == 1}
                            selectedSpecies={this.props.selectedSpecies}
                            onSelectSpecies={this.props.onSelectSpecies}
                        />
                )}
                {this.state.species.map(
                    (species) =>
                        <TaxonomySpecies
                            species={species}
                            selected={this.props.selectedSpecies.includes(species.id)}
                            onSelect={this.props.onSelectSpecies.bind(null, species.id)}
                        />
                )}
            </ul>
        </li>
    }
}

export class TaxonomyViewComponent extends React.Component<ViewProps, TaxonomyViewState> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {baseCategories: [], categoryLevels: []};
        this.onSelectSpecies = this.onSelectSpecies.bind(this);
    }

    async componentDidMount(): Promise<void> {
        const categoryLevelsPromise = this.props.animalData.promiseCategoryLevels();
        const baseCategoriesPromise = this.props.animalData.promiseBaseCategories();
        const [categoryLevels, baseCategories] = await Promise.all([categoryLevelsPromise, baseCategoriesPromise]);
        this.setState({baseCategories: baseCategories, categoryLevels: categoryLevels});
    }

    onSelectSpecies(speciesId: number) {
        console.log("Top level select species: "+speciesId);
        this.props.selection.toggleSpecies(speciesId);
        this.forceUpdate();
    }

    render() {
        const baseCategories = this.state.baseCategories.map(
            (category) =>
                <TaxonomyCategory
                    animalData={this.props.animalData}
                    selection={this.props.selection}
                    categoryLevels={this.state.categoryLevels}
                    category={category}
                    odd={true}
                    autoExpand={true}
                    selectedSpecies={this.props.selection.selectedSpeciesIds}
                    onSelectSpecies={this.onSelectSpecies}
                    />);
        return <ul className="odd">
            {baseCategories}
        </ul>
    }
}
