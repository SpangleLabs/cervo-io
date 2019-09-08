import * as React from "react";
import {ViewProps} from "./views";
import {CategoryData, SpeciesData} from "../animalData";
import {TickBox} from "./tickbox";
import {CategoryLevelJson} from "../../../common-lib/src/apiInterfaces";

interface CategoryProps extends ViewProps {
    category: CategoryData;
    categoryLevels: CategoryLevelJson[];
}
interface CategoryState {
    expand: boolean,
    selected: boolean,
    gotFullData: boolean,
    subCategories: CategoryData[],
    species: SpeciesData[]
}

interface TaxonomyViewState {
    baseCategories: CategoryData[];
    categoryLevels: CategoryLevelJson[];
}

class TaxonomyCategory extends React.Component<CategoryProps, CategoryState> {
    constructor(props: CategoryProps) {
        super(props);
        this.state = {expand: false, selected: false, gotFullData: false, subCategories: [], species: []};
        this.expand = this.expand.bind(this);
        this.select = this.select.bind(this);
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
        console.log("Expand me " + this.props.category.name);
    }

    select() {
        console.log("Select me " + this.props.category.name);
    }

    render() {
        return <li className="category">
            <span className="clickable" onClick={this.expand}>
                <span className="category_name">{this.props.category.name}</span>
                <span className="category_level">{this.categoryLevelName()}</span>
            </span>
            <span className="clickable selector" onClick={this.select}>
                <TickBox selected={this.state.selected} />
            </span>
            <ul className="odd">
                {this.state.subCategories.map((category) => <TaxonomyCategory category={category} categoryLevels={this.props.categoryLevels} animalData={this.props.animalData} selection={this.props.selection} />)}
            </ul>
        </li>
    }
}

export class TaxonomyViewComponent extends React.Component<ViewProps, TaxonomyViewState> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {baseCategories: [], categoryLevels: []};
    }

    async componentDidMount(): Promise<void> {
        const categoryLevelsPromise = this.props.animalData.promiseCategoryLevels();
        const baseCategoriesPromise = this.props.animalData.promiseBaseCategories();
        const [categoryLevels, baseCategories] = await Promise.all([categoryLevelsPromise, baseCategoriesPromise]);
        this.setState({baseCategories: baseCategories, categoryLevels: categoryLevels});
    }

    render() {
        const baseCategories = this.state.baseCategories.map(
            (category) =>
                <TaxonomyCategory
                    animalData={this.props.animalData}
                    selection={this.props.selection}
                    categoryLevels={this.state.categoryLevels}
                    category={category}
                    />);
        return <>
            {baseCategories}
        </>
    }
}
