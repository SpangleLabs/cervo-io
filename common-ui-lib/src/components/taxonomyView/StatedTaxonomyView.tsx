import * as React from "react";
import {
    create,
    TaxonomyTreeState,
    treeAddCategory,
    treeAddSpecies,
    treeExpandCategory,
    treeToggleSelectCategory
} from "../../taxonomyState";
import {NewCategoryJson, NewSpeciesJson} from "../../../../common-lib/src/apiInterfaces";
import {Spinner} from "../images/images";
import {AnimalData} from "../../animalData";
import {StatedTaxonomyCategory} from "./StatedTaxonomyCategory";

const styles = require("./StatedTaxonomyCategory.css")

interface StatedTaxonomyViewProps {
    animalData: AnimalData;
    selectedSpecies: number[];
    selectableSpecies?: boolean;
    selectableCategories?: boolean;
    onSelectSpecies?: (speciesId: number, selected?: boolean) => void;
    editableTaxonomy?: boolean
    onNewSpeciesCreated?: (speciesId: number) => Promise<void>;
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
        this.setState({isLoading: true});
        const newTree = await treeExpandCategory(this.state.taxonomy, categoryPath);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    async selectCategory(categoryPath: number[]) {
        this.setState({isLoading: true});
        const newTree = await treeToggleSelectCategory(this.state.taxonomy, categoryPath);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    async addCategory(categoryParentPath: number[], newCategory: NewCategoryJson): Promise<void> {
        this.setState({isLoading: true});
        const category = await this.props.animalData.addCategory(newCategory);
        const newTree = await treeAddCategory(this.state.taxonomy, categoryParentPath, category);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    async addSpecies(categoryParentPath: number[], newSpecies: NewSpeciesJson): Promise<void> {
        this.setState({isLoading: true});
        const species = await this.props.animalData.addSpecies(newSpecies);
        await this.props.onNewSpeciesCreated(species.id);
        const newTree = await treeAddSpecies(this.state.taxonomy, categoryParentPath, species);
        this.setState({taxonomy: newTree, isLoading: false});
    }

    render() {
        const baseCategories = this.state.taxonomy.rootCategories.map(
            (category) =>
                <StatedTaxonomyCategory
                    key={"category-" + category.data.id}
                    category={category}
                    path={[category.data.id]}
                    odd={true}
                    selectedSpecies={this.props.selectedSpecies}
                    onExpandCategory={this.expandCategory.bind(this)}
                    onSelectCategory={this.props.selectableCategories ? this.selectCategory.bind(this) : null}
                    onSelectSpecies={this.props.selectableSpecies ? this.props.onSelectSpecies : null}
                    editableTaxonomy={this.props.editableTaxonomy}
                    onAddCategory={this.props.editableTaxonomy ? this.addCategory.bind(this) : null}
                    onAddSpecies={this.props.editableTaxonomy ? this.addSpecies.bind(this) : null}
                />);
        return <ul className={styles.odd}>
            {baseCategories}
            {this.state.isLoading ? <Spinner/> : ""}
        </ul>
    }
}