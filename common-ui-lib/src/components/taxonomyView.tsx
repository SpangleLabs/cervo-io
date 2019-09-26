import * as React from "react";
import {AnimalData, SpeciesData} from "../animalData";
import {TickBox} from "./tickbox";
import {CategoryLevelJson, NewCategoryJson, NewSpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";
import {Spinner} from "./images";
import {
    create,
    TaxonomyCategoryState,
    TaxonomyTreeState, treeAddCategory, treeAddSpecies,
    treeExpandCategory,
    treeToggleSelectCategory
} from "../taxonomyState";
import {ChangeEvent, FormEvent} from "react";


interface TaxonomySpeciesProps {
    species: SpeciesData;
    selected?: boolean;
    onSelect?: () => void
}
interface TaxonomySpeciesState {
}
class TaxonomySpecies extends React.Component<TaxonomySpeciesProps, TaxonomySpeciesState> {
    constructor(props: TaxonomySpeciesProps) {
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

interface StatedTaxonomyViewProps {
    animalData: AnimalData;
    selectedSpecies: number[];
    onSelectSpecies?: (speciesId: number, selected?: boolean) => void;
    editableTaxonomy?: boolean
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

    async addCategory(categoryParentPath: number[], newCategory: NewCategoryJson): Promise<void> {
        console.log("Create new category at path: "+categoryParentPath);
        console.log(newCategory);
        this.setState({isLoading: true});
        const category = await this.props.animalData.addCategory(newCategory);
        const newTree = await treeAddCategory(this.state.taxonomy, categoryParentPath, category);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    async addSpecies(categoryParentPath: number[], newSpecies: NewSpeciesJson): Promise<void> {
        console.log("Create new species at path: "+categoryParentPath);
        console.log(newSpecies);
        this.setState({isLoading: true});
        const species = await this.props.animalData.addSpecies(newSpecies);
        const newTree = await treeAddSpecies(this.state.taxonomy, categoryParentPath, species);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    render() {
        const selectableTaxonomy = this.props.onSelectSpecies != null;
        const baseCategories = this.state.taxonomy.rootCategories.map(
            (category) =>
                <StatedTaxonomyCategory
                    key = {"category-"+category.data.id}
                    category={category}
                    path={[category.data.id]}
                    odd={true}
                    selectedSpecies={this.props.selectedSpecies}
                    expandCategory={this.expandCategory.bind(this)}
                    selectCategory={selectableTaxonomy ? this.selectCategory.bind(this) : null}
                    selectSpecies={selectableTaxonomy ? this.props.onSelectSpecies : null}
                    editableTaxonomy={this.props.editableTaxonomy}
                    addCategory={this.props.editableTaxonomy ? this.addCategory.bind(this) : null}
                    addSpecies={this.props.editableTaxonomy ? this.addSpecies.bind(this) : null}
                />);
        return <ul className="odd">
            {baseCategories}
            {this.state.isLoading ? <Spinner/> : ""}
        </ul>
    }
}

interface CategorySelectorProps {
    selectCategory: () => Promise<void> | null;
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
    selectCategory: (categoryPath: number[]) => Promise<void> | null;
    selectSpecies: (speciesId: number) => void | null;
    editableTaxonomy: boolean;
    addCategory: (categoryParentPath: number[], newCategory: NewCategoryJson) => Promise<void> | null;
    addSpecies: (categoryParentPath: number[], newSpecies: NewSpeciesJson) => Promise<void> | null;
}
interface StatedTaxonomyCategoryState {

}
class StatedTaxonomyCategory extends React.Component<StatedTaxonomyCategoryProps, StatedTaxonomyCategoryState> {
    render() {
        const liClassName = `category ${this.props.category.expanded ? "open" : "closed"} ${this.props.category.selected ? "selected" : ""}`;
        const ulClassName = `${this.props.odd ? "even" : "odd"} ${this.props.category.expanded ? "" : "hidden"}`;
        const selectableTaxonomy = !!this.props.selectSpecies;
        const selectCategory = selectableTaxonomy ? this.props.selectCategory.bind(null, this.props.path) : null;
        return <li className={liClassName}>
            <span className="clickable" onClick={this.props.expandCategory.bind(null, this.props.path)}>
                <span className="category_name">{this.props.category.data.name}</span>
                <span className="category_level">{this.props.category.categoryLevel}</span>
            </span>
            <CategorySelector selectCategory={selectCategory} selected={this.props.category.selected} />
            <ul className={ulClassName}>
                {this.props.editableTaxonomy && <EditTaxonomyForm
                    parentCategory={this.props.category}
                    addCategory={this.props.addCategory.bind(null, this.props.path)}
                    addSpecies={this.props.addSpecies.bind(null, this.props.path)}
                />}
                {this.props.category.subCategories.map(
                    (category) =>
                        <StatedTaxonomyCategory
                            key = {"category-"+category.data.id}
                            category={category}
                            path={this.props.path.concat([category.data.id])}
                            odd={!this.props.odd}
                            selectedSpecies={this.props.selectedSpecies}
                            expandCategory={this.props.expandCategory}
                            selectCategory={selectableTaxonomy ? this.props.selectCategory : null}
                            selectSpecies={selectableTaxonomy ? this.props.selectSpecies : null}
                            editableTaxonomy={this.props.editableTaxonomy}
                            addCategory={this.props.editableTaxonomy ? this.props.addCategory : null}
                            addSpecies={this.props.editableTaxonomy ? this.props.addSpecies : null}
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

interface EditTaxonomyFormProps {
    parentCategory: TaxonomyCategoryState;
    addCategory: (newCategory: NewCategoryJson) => Promise<void>;
    addSpecies: (newSpecies: NewSpeciesJson) => Promise<void>;
}
interface EditTaxonomyFormState {

}
class EditTaxonomyForm extends React.Component<EditTaxonomyFormProps, EditTaxonomyFormState> {
    render() {
        if(this.props.parentCategory.data.categoryLevelId == 1) {
            return <AddSpeciesForm
                parentCategory={this.props.parentCategory}
                addSpecies={this.props.addSpecies}
            />
        } else {
            return <AddCategoryForm
                parentCategory={this.props.parentCategory}
                addCategory={this.props.addCategory}
            />
        }
    }
}

interface AddCategoryFormProps {
    parentCategory: TaxonomyCategoryState;
    addCategory: (newCategory: NewCategoryJson) => Promise<void>;
}
interface AddCategoryFormState {
    name: string;
    categoryLevel: number;
    hidden: boolean;
    categoryLevels: CategoryLevelJson[];
}
class AddCategoryForm extends React.Component<AddCategoryFormProps, AddCategoryFormState> {
    constructor(props: AddCategoryFormProps) {
        super(props);
        this.state = {name: "", categoryLevel: this.props.parentCategory.data.categoryLevelId, hidden: false, categoryLevels: []}
    }

    async componentDidMount() {
        const categoryLevels = await this.props.parentCategory.data.animalData.promiseCategoryLevels();
        this.setState({categoryLevels: categoryLevels});
    }

    onChangeName(event: ChangeEvent<HTMLInputElement>) {
        this.setState({name: event.target.value});
    }

    onChangeCategoryLevel(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({categoryLevel: Number(event.target.value)});
    }

    onChangeHidden(event: ChangeEvent<HTMLInputElement>) {
        this.setState({hidden: event.target.checked})
    }

    async onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const newCategory: NewCategoryJson = {
            name: this.state.name,
            category_level_id: this.state.categoryLevel,
            parent_category_id: this.props.parentCategory.data.id,
            hidden: this.state.hidden
        };
        await this.props.addCategory(newCategory);
        this.setState({name: "", categoryLevel: this.props.parentCategory.data.categoryLevelId, hidden: false});
    }

    render() {
        return <li className='category add'>
            <span>Add category </span>
            <form onSubmit={this.onSubmit.bind(this)}>
                <input type='text' placeholder="name" value={this.state.name} onChange={this.onChangeName.bind(this)}/>
                <select value={this.state.categoryLevel} onChange={this.onChangeCategoryLevel.bind(this)}>
                    {this.state.categoryLevels.map(x => <option value={x.category_level_id}>{x.name}</option>)}
                </select>
                <input type='submit'/>
                <label>Hidden?<input type='checkbox' checked={this.state.hidden} onChange={this.onChangeHidden.bind(this)} /></label>
            </form>
        </li>
    }
}

interface AddSpeciesFormProps {
    parentCategory: TaxonomyCategoryState;
    addSpecies: (newSpecies: NewSpeciesJson) => Promise<void>;
}
interface AddSpeciesFormState {
    commonName: string;
    latinName: string;
    hidden: boolean;
}
class AddSpeciesForm extends React.Component<AddSpeciesFormProps, AddSpeciesFormState> {
    constructor(props: AddSpeciesFormProps) {
        super(props);
        this.state = {commonName: "", latinName: "", hidden: false}
    }

    onChangeCommonName(event: ChangeEvent<HTMLInputElement>) {
        this.setState({commonName: event.target.value});
    }

    onChangeLatinName(event: ChangeEvent<HTMLInputElement>) {
        this.setState({latinName: event.target.value});
    }

    onChangeHidden(event: ChangeEvent<HTMLInputElement>) {
        this.setState({hidden: event.target.checked});
    }

    async onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const newSpecies: NewSpeciesJson = {
            common_name: this.state.commonName,
            latin_name: this.state.latinName,
            category_id: this.props.parentCategory.data.id,
            hidden: this.state.hidden
        };
        const self = this;
        await this.props.addSpecies(newSpecies);
        self.setState({commonName: "", latinName: "", hidden: false});
    }

    render() {
        return <li className='species add'>
            <span>Add species </span>
            <form onSubmit={this.onSubmit.bind(this)}>
                <input type='text' placeholder='Common name' value={this.state.commonName} onChange={this.onChangeCommonName.bind(this)} />
                <input type='text' placeholder='latin name' value={this.state.latinName} onChange={this.onChangeLatinName.bind(this)} />
                <label>Hidden?<input type='checkbox' checked={this.state.hidden} onChange={this.onChangeHidden.bind(this)} /></label>
                <input type='submit'/>
            </form>
        </li>
    }
}
