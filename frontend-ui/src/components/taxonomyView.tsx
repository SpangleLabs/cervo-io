import * as React from "react";
import {ViewProps} from "./views";
import {CategoryData, SpeciesData} from "../animalData";
import {TickBox} from "./tickbox";
import {CategoryLevelJson} from "@cervoio/common-lib/src/apiInterfaces";
import {Spinner} from "@cervoio/common-ui-lib/src/components/images";


interface TaxonomyViewState {
    baseCategories: CategoryData[];
    categoryLevels: CategoryLevelJson[];
    isLoading: boolean
}
interface CategoryProps extends ViewProps {
    category: CategoryData;
    categoryLevels: CategoryLevelJson[];
    autoExpand: boolean;
    autoSelect: boolean;
    odd: boolean;
}
interface CategoryState {
    expand: boolean,
    selected: boolean,
    gotFullData: boolean,
    subCategories: CategoryData[],
    species: SpeciesData[],
    isLoading: boolean
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
        this.state = {expand: false, selected: false, gotFullData: false, subCategories: [], species: [], isLoading: false};
        this.expand = this.expand.bind(this);
        this.selectCategory = this.selectCategory.bind(this);
    }

    async componentDidMount() {
        if(this.props.autoExpand) {
            this.expand();
        }
        if(this.props.autoSelect) {
            await this.selectCategory(this.props.autoSelect);
        }
    }

    async componentDidUpdate(prevProps: CategoryProps) {
        if(this.props.autoSelect != prevProps.autoSelect) {
            this.setState({selected: this.props.autoSelect});
            this.selectChildSpecies(this.props.autoSelect);
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
            this.setState({isLoading: true});
            const [subCategories, species] = await Promise.all([this.props.category.getSubCategories(), this.props.category.getSpecies()]);
            this.setState({gotFullData: true, subCategories: subCategories, species: species});
            this.setState({isLoading: false});
        }
    }

    async expand() {
        await this.populate();
        this.setState((state) => {return {expand: !state.expand}});
    }

    async selectCategory(selected?: boolean) {
        if(selected == undefined) {
            this.setState((state) => {
                this.selectChildSpecies(!state.selected);
                return {selected: !state.selected}
            });
        } else {
            this.setState({selected: selected});
            this.selectChildSpecies(selected);
        }
    }

    async selectChildSpecies(selected?: boolean) {
        await this.populate();
        this.state.species.map((species) => this.props.onSelectSpecies(species.id, selected));
    }

    render() {
        const liClassName = `category ${this.state.expand ? "open" : "closed"} ${this.state.selected ? "selected" : ""}`;
        const ulClassName = `${this.props.odd ? "even" : "odd"} ${this.state.expand ? "" : "hidden"}`;
        return <li className={liClassName}>
            <span className="clickable" onClick={this.expand}>
                <span className="category_name">{this.props.category.name}</span>
                <span className="category_level">{this.categoryLevelName()}</span>
            </span>
            <span className="clickable selector" onClick={this.selectCategory.bind(this, undefined)}>
                <TickBox selected={this.state.selected} />
            </span>
            {this.state.isLoading ? <Spinner /> : ""}
            <ul className={ulClassName}>
                {this.state.subCategories.map(
                    (category) =>
                        <TaxonomyCategory
                            key={"category-"+category.id}
                            category={category}
                            categoryLevels={this.props.categoryLevels}
                            animalData={this.props.animalData}
                            odd={!this.props.odd}
                            autoExpand={this.state.subCategories.length == 1}
                            autoSelect={this.state.selected}
                            selectedSpeciesIds={this.props.selectedSpeciesIds}
                            onSelectSpecies={this.props.onSelectSpecies}
                        />
                )}
                {this.state.species.map(
                    (species) =>
                        <TaxonomySpecies
                            key={"species-"+species.id}
                            species={species}
                            selected={this.props.selectedSpeciesIds.includes(species.id)}
                            onSelect={this.props.onSelectSpecies.bind(null, species.id, undefined)}
                        />
                )}
            </ul>
        </li>
    }
}

export class TaxonomyViewComponent extends React.Component<ViewProps, TaxonomyViewState> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {baseCategories: [], categoryLevels: [], isLoading: false};
    }

    async componentDidMount(): Promise<void> {
        const categoryLevelsPromise = this.props.animalData.promiseCategoryLevels();
        const baseCategoriesPromise = this.props.animalData.promiseBaseCategories();
        this.setState({isLoading: true});
        const [categoryLevels, baseCategories] = await Promise.all([categoryLevelsPromise, baseCategoriesPromise]);
        this.setState({baseCategories: baseCategories, categoryLevels: categoryLevels, isLoading: false});
    }

    render() {
        const baseCategories = this.state.baseCategories.map(
            (category) =>
                <TaxonomyCategory
                    key = {"category-"+category.id}
                    animalData={this.props.animalData}
                    selectedSpeciesIds={this.props.selectedSpeciesIds}
                    onSelectSpecies={this.props.onSelectSpecies}
                    categoryLevels={this.state.categoryLevels}
                    category={category}
                    odd={true}
                    autoExpand={true}
                    autoSelect={false}
                    />);
        return <ul className="odd">
            {this.state.isLoading ? <Spinner/> : ""}
            {baseCategories}
        </ul>
    }
}
