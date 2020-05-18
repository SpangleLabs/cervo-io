import {TaxonomyCategoryState} from "../../../taxonomyState";
import {CategoryLevelJson, NewCategoryJson} from "@cervoio/common-lib/src/apiInterfaces";
import React, {useEffect, useState} from "react";
import {ChangeEvent, FormEvent} from "react";


interface AddCategoryFormProps {
    parentCategory: TaxonomyCategoryState;
    addCategory: (newCategory: NewCategoryJson) => Promise<void>;
}

export const AddCategoryForm: React.FunctionComponent<AddCategoryFormProps> = (props) => {
    const defaultCategoryLevel = () => {
        let defaultCategoryLevel = props.parentCategory.data.categoryLevelId;
        if (props.parentCategory.subCategories.length != 0) {
            defaultCategoryLevel = props.parentCategory.subCategories[0].data.categoryLevelId;
        }
        return defaultCategoryLevel;
    }
    const [name, setName] = useState("")
    const [categoryLevel, setCategoryLevel] = useState(defaultCategoryLevel())
    const [hidden, setHidden] = useState(false)
    const [categoryLevels, setCategoryLevels] = useState<CategoryLevelJson[]>([]);

    useEffect(() => {
        props.parentCategory.data.animalData.promiseCategoryLevels()
            .then((cLevels) => {
                setCategoryLevels(cLevels)
            })
    }, [])

    const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value.toLowerCase())
        setCategoryLevel((defaultCategoryLevel))
    }

    const onChangeCategoryLevel = (event: ChangeEvent<HTMLSelectElement>) => {
        setCategoryLevel(Number(event.target.value))
    }

    const onChangeHidden = (event: ChangeEvent<HTMLInputElement>) => {
        setHidden(event.target.checked)
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newCategory: NewCategoryJson = {
            name: name,
            category_level_id: categoryLevel,
            parent_category_id: props.parentCategory.data.id,
            hidden: hidden
        };
        await props.addCategory(newCategory);
        setName("")
        setCategoryLevel(defaultCategoryLevel())
        setHidden(false)
    }

    return <li>
        <span>Add category </span>
        <form onSubmit={onSubmit}>
            <input type='text' placeholder="name" value={name} onChange={onChangeName}/>
            <select value={categoryLevel} onChange={onChangeCategoryLevel}>
                {categoryLevels.map(x => <option value={x.category_level_id}>{x.name}</option>)}
            </select>
            <input type='submit'/>
            <label>Hidden?<input type='checkbox' checked={hidden} onChange={onChangeHidden}/></label>
        </form>
    </li>
}
