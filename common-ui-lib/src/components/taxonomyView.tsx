import * as React from "react";
import {ViewProps} from "../views";
import {AnimalData, CategoryData, SpeciesData} from "../animalData";
import {TickBox} from "./tickbox";
import {CategoryLevelJson, NewCategoryJson, NewSpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";
import {Spinner} from "./images";
import {
    create,
    TaxonomyCategoryState,
    TaxonomyTreeState,
    treeExpandCategory,
    treeToggleSelectCategory
} from "../taxonomyState";


interface NonSelectableTaxonomyViewProps {
    animalData: AnimalData;
}
interface TaxonomyViewState {
    baseCategories: CategoryData[];
    categoryLevels: CategoryLevelJson[];
    isLoading: boolean
}
interface CategoryProps {
    animalData: AnimalData;
    category: CategoryData;
    categoryLevels: CategoryLevelJson[];
    autoExpand: boolean;
    odd: boolean;
    selectedSpeciesIds?: number[];
    onSelectSpecies?: (speciesId: number, selected?: boolean) => void;
    autoSelect?: boolean;
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
    selected?: boolean;
    onSelect?: () => void
}
interface SpeciesState {
}


class TaxonomySpecies extends React.Component<SpeciesProps, SpeciesState> {
    constructor(props: SpeciesProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onSelect();
    }

    render() {
        const liClassName = `species ${this.props.selected ? "selected" : ""}`;
        const spanClassName = this.props.onSelect ? "clickable" : "";
        const tickbox = this.props.onSelect == null ? null : <TickBox selected={this.props.selected} />;
        return <li className={liClassName}>
            <span className={spanClassName} onClick={this.onClick}>
                <span className="species_name">{this.props.species.commonName}</span>
                <span className="latin_name">{this.props.species.latinName}</span>
                {tickbox}
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
        let categoryCheckbox = null;
        if(this.props.onSelectSpecies != null) {
            categoryCheckbox = <span className="clickable selector" onClick={this.selectCategory.bind(this, undefined)}>
                <TickBox selected={this.state.selected} />
            </span>
        }
        return <li className={liClassName}>
            <span className="clickable" onClick={this.expand}>
                <span className="category_name">{this.props.category.name}</span>
                <span className="category_level">{this.categoryLevelName()}</span>
            </span>
            {categoryCheckbox}
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
                            selected={this.props.selectedSpeciesIds == null ? false : this.props.selectedSpeciesIds.includes(species.id)}
                            onSelect={this.props.onSelectSpecies == null ? null : this.props.onSelectSpecies.bind(null, species.id, undefined)}
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

export class NonSelectableTaxonomyViewComponent extends React.Component<NonSelectableTaxonomyViewProps, TaxonomyViewState> {
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
                    categoryLevels={this.state.categoryLevels}
                    category={category}
                    odd={true}
                    autoExpand={true}
                />);
        return <ul className="odd">
            {this.state.isLoading ? <Spinner/> : ""}
            {baseCategories}
        </ul>
    }
}

interface StatedTaxonomyViewProps {
    animalData: AnimalData;
    selectedSpecies: number[];
    onSelectSpecies?: (speciesId: number, selected?: boolean) => void
}
interface StatedTaxonomyViewState {
    taxonomy: TaxonomyTreeState
    isLoading: boolean
}
export class StatedTaxonomyView extends React.Component<StatedTaxonomyViewProps, StatedTaxonomyViewState> {
    constructor(props: StatedTaxonomyViewProps) {
        super(props);
        const taxonomy: TaxonomyTreeState = {categoryLevels: [], rootCategories: []};
        this.state = {taxonomy: taxonomy, isLoading: true}
    }

    async componentDidMount(): Promise<void> {
        const taxonomy = await create(this.props.animalData, this.props.onSelectSpecies);
        this.setState({taxonomy: taxonomy, isLoading: false});
    }

    async expandCategory(categoryPath: number[]) {
        console.log("react expandCategory("+categoryPath);
        this.setState({isLoading: true});
        const newTree = await treeExpandCategory(this.state.taxonomy, categoryPath);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    async selectCategory(categoryPath: number[]) {
        console.log("react selectCategory("+categoryPath);
        this.setState({isLoading: true});
        const newTree = await treeToggleSelectCategory(this.state.taxonomy, categoryPath);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    async addCategory(categoryParentPath: number[], newCategory: NewCategoryJson) {
        console.log("Create new category at path: "+categoryParentPath);
        console.log(newCategory);
        this.setState({isLoading: true});
        const category = await this.props.animalData.addCategory(newCategory);
        const newTree = await treeAddCategory(categoryParentPath, category);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    async addSpecies(categoryParentPath: number[], newSpecies: NewSpeciesJson) {
        console.log("Create new species at path: "+categoryParentPath);
        console.log(newSpecies);
        this.setState({isLoading: true});
        const species = await this.props.animalData.addSpecies(newSpecies);
        const newTree = await treeAddSpecies(categoryParentPath, species);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    render() {
        const selectCategory = this.props.onSelectSpecies == null ? null : this.selectCategory.bind(this);
        const baseCategories = this.state.taxonomy.rootCategories.map(
            (category) =>
                <StatedTaxonomyCategory
                    key = {"category-"+category.data.id}
                    category={category}
                    path={[category.data.id]}
                    odd={true}
                    selectedSpecies={this.props.selectedSpecies}
                    selectCategory={selectCategory}
                    expandCategory={this.expandCategory.bind(this)}
                    selectSpecies={this.props.onSelectSpecies}
                />);
        return <ul className="odd">
            {baseCategories}
            {this.state.isLoading ? <Spinner/> : ""}
        </ul>
    }
}

interface CategorySelectorProps {
    selectCategory: () => Promise<void>;
    selected: boolean;
}
interface CategorySelectorState {

}
class CategorySelector extends React.Component<CategorySelectorProps, CategorySelectorState> {
    render() {
        if(this.props.selectCategory != null) {
            return <span className="clickable selector" onClick={this.props.selectCategory}>
                <TickBox selected={this.props.selected} />
            </span>
        }
        return null;
    }
}

interface StatedTaxonomyCategoryProps {
    category: TaxonomyCategoryState;
    path: number[];
    odd: boolean;
    selectedSpecies: number[];
    expandCategory: (categoryPath: number[]) => Promise<void>;
    selectCategory?: (categoryPath: number[]) => Promise<void>;
    selectSpecies?: (speciesId: number) => void;
}
interface StatedTaxonomyCategoryState {

}
class StatedTaxonomyCategory extends React.Component<StatedTaxonomyCategoryProps, StatedTaxonomyCategoryState> {
    render() {
        const liClassName = `category ${this.props.category.expanded ? "open" : "closed"} ${this.props.category.selected ? "selected" : ""}`;
        const ulClassName = `${this.props.odd ? "even" : "odd"} ${this.props.category.expanded ? "" : "hidden"}`;
        const selectCategory = this.props.selectCategory == null ? null : this.props.selectCategory.bind(null, this.props.path);
        return <li className={liClassName}>
            <span className="clickable" onClick={this.props.expandCategory.bind(null, this.props.path)}>
                <span className="category_name">{this.props.category.data.name}</span>
                <span className="category_level">{this.props.category.categoryLevel}</span>
            </span>
            <CategorySelector selectCategory={selectCategory} selected={this.props.category.selected} />
            <ul className={ulClassName}>
                {this.props.category.subCategories.map(
                    (category) =>
                        <StatedTaxonomyCategory
                            key = {"category-"+category.data.id}
                            category={category}
                            path={this.props.path.concat([category.data.id])}
                            odd={!this.props.odd}
                            selectedSpecies={this.props.selectedSpecies}
                            selectCategory={this.props.selectCategory}
                            expandCategory={this.props.expandCategory}
                            selectSpecies={this.props.selectSpecies}
                        />
                )}
                {this.props.category.species.map(
                    (species) =>
                        <TaxonomySpecies
                            key={"species-"+species.data.id}
                            species={species.data}
                            selected={this.props.selectedSpecies.includes(species.data.id)}
                            onSelect={this.props.selectSpecies == null ? null : this.props.selectSpecies.bind(null, species.data.id)}
                        />
                )}
            </ul>
        </li>
    }
}

//
// class SelectableTaxonomySpecies extends React.Component<SpeciesProps, SpeciesState> {
//
// }
//
// class SelectableTaxonomyView extends React.Component<ViewProps, TaxonomyViewState> {
//     constructor(props: ViewProps) {
//         super(props);
//         this.state = {baseCategories: [], categoryLevels: [], isLoading: false};
//     }
//
//     async componentDidMount(): Promise<void> {
//         const categoryLevelsPromise = this.props.animalData.promiseCategoryLevels();
//         const baseCategoriesPromise = this.props.animalData.promiseBaseCategories();
//         this.setState({isLoading: true});
//         const [categoryLevels, baseCategories] = await Promise.all([categoryLevelsPromise, baseCategoriesPromise]);
//         this.setState({baseCategories: baseCategories, categoryLevels: categoryLevels, isLoading: false});
//     }
//
//     render() {
//         const baseCategories = this.state.baseCategories.map(
//             (category) =>
//                 <TaxonomyCategory
//                     key = {"category-"+category.id}
//                     animalData={this.props.animalData}
//                     selectedSpeciesIds={this.props.selectedSpeciesIds}
//                     onSelectSpecies={this.props.onSelectSpecies}
//                     categoryLevels={this.state.categoryLevels}
//                     category={category}
//                     odd={true}
//                     autoExpand={true}
//                     autoSelect={false}
//                 />);
//         return <ul className="odd">
//             {this.state.isLoading ? <Spinner/> : ""}
//             {baseCategories}
//         </ul>
//     }
// }