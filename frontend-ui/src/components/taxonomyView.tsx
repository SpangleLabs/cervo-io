import * as React from "react";
import {ViewProps} from "./views";
import {CategoryData} from "../animalData";
import {TickBox} from "./tickbox";
import {CategoryLevelJson} from "../../../common-lib/src/apiInterfaces";

interface CategoryProps extends ViewProps {
    category: CategoryData;
    categoryLevels: CategoryLevelJson[];
}

interface TaxonomyViewState {
    baseCategories: CategoryData[];
    categoryLevels: CategoryLevelJson[];
}

class TaxonomyCategory extends React.Component<CategoryProps, {expand: boolean, selected: boolean}> {
    constructor(props: CategoryProps) {
        super(props);
        this.state = {expand: false, selected: false};
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

    expand() {
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
