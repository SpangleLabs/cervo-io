import {TaxonomyCategoryState} from "../../../taxonomyState";
import {CategoryLevelJson, NewCategoryJson} from "../../../../../common-lib/src/apiInterfaces";
import * as React from "react";
import {ChangeEvent, FormEvent} from "react";


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
export class AddCategoryForm extends React.Component<AddCategoryFormProps, AddCategoryFormState> {
    constructor(props: AddCategoryFormProps) {
        super(props);
        this.state = {name: "", categoryLevel: this.defaultCategoryLevel(), hidden: false, categoryLevels: []}
    }

    defaultCategoryLevel() {
        let defaultCategoryLevel = this.props.parentCategory.data.categoryLevelId;
        if (this.props.parentCategory.subCategories.length != 0) {
            defaultCategoryLevel = this.props.parentCategory.subCategories[0].data.categoryLevelId;
        }
        return defaultCategoryLevel;
    }

    async componentDidMount() {
        const categoryLevels = await this.props.parentCategory.data.animalData.promiseCategoryLevels();
        this.setState({categoryLevels: categoryLevels});
    }

    onChangeName(event: ChangeEvent<HTMLInputElement>) {
        this.setState({name: event.target.value.toLowerCase(), categoryLevel: this.defaultCategoryLevel()});
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
        this.setState({name: "", categoryLevel: this.defaultCategoryLevel(), hidden: false});
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
