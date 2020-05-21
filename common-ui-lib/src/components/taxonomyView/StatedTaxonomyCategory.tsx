import React from "react";
import {HiddenStatus} from "./admin/HiddenStatus";
import {TaxonomyCategoryState} from "../../taxonomyState";
import {NewCategoryJson, NewSpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";
import {CategorySelector} from "./CategorySelector";
import {EditTaxonomyForm} from "./admin/EditTaxonomyForm";
import classNames from "classnames";
import {SelectableSpeciesEntry} from "../speciesEntry/SelectableSpeciesEntry";

const styles = require("./StatedTaxonomyCategory.css")

interface StatedTaxonomyCategoryProps {
    category: TaxonomyCategoryState;
    path: number[];
    odd: boolean;
    selectedSpecies: number[];
    onExpandCategory: (categoryPath: number[]) => Promise<void>;
    onSelectCategory?: (categoryPath: number[]) => Promise<void>
    onSelectSpecies?: (speciesId: number) => Promise<void>
    editableTaxonomy: boolean;
    onAddCategory: (categoryParentPath: number[], newCategory: NewCategoryJson) => Promise<void> | null;
    onAddSpecies: (categoryParentPath: number[], newSpecies: NewSpeciesJson) => Promise<void> | null;
}

export const StatedTaxonomyCategory: React.FunctionComponent<StatedTaxonomyCategoryProps> = (props) => {
    const liClassName = classNames(
        styles.category,
        {
            [styles.open]: props.category.expanded,
            [styles.closed]: !props.category.expanded,
            [styles.selected]: props.category.selected
        }
    )
    const ulClassName = classNames(
        {
            [styles.even]: props.odd,
            [styles.odd]: !props.odd,
            [styles.hidden]: !props.category.expanded
        }
    )
    const selectableSpecies = !!props.onSelectSpecies;
    const selectableCategories = !!props.onSelectCategory;
    const selectCategory = selectableCategories ? props.onSelectCategory.bind(null, props.path) : null;
    return <li className={liClassName}>
            <span className={styles.clickable} onClick={props.onExpandCategory.bind(null, props.path)}>
                <span className={styles.categoryName}>{props.category.data.name}</span>
                <span className={styles.categoryLevel}>{props.category.categoryLevel}</span>
                {props.editableTaxonomy && <HiddenStatus hidden={props.category.data.hidden}/>}
            </span>
        <CategorySelector selectCategory={selectCategory} selected={props.category.selected}/>
        <ul className={ulClassName}>
            {props.editableTaxonomy && <EditTaxonomyForm
                parentCategory={props.category}
                addCategory={props.onAddCategory.bind(null, props.path)}
                addSpecies={props.onAddSpecies.bind(null, props.path)}
            />}
            {props.category.subCategories.map(
                (category) =>
                    <StatedTaxonomyCategory
                        key={"category-" + category.data.id}
                        category={category}
                        path={props.path.concat([category.data.id])}
                        odd={!props.odd}
                        selectedSpecies={props.selectedSpecies}
                        onExpandCategory={props.onExpandCategory}
                        onSelectCategory={selectableCategories ? props.onSelectCategory : null}
                        onSelectSpecies={selectableSpecies ? props.onSelectSpecies : null}
                        editableTaxonomy={props.editableTaxonomy}
                        onAddCategory={props.editableTaxonomy ? props.onAddCategory : null}
                        onAddSpecies={props.editableTaxonomy ? props.onAddSpecies : null}
                    />
            )}
            {props.category.species.map(
                (species) =>
                    <SelectableSpeciesEntry
                        key={species.data.id}
                        species={species.data}
                        selectedSpeciesIds={props.selectedSpecies}
                        showLatinName={true}
                        onSelectSpecies={props.onSelectSpecies}
                        odd={!props.odd}
                    >
                        {props.editableTaxonomy && <HiddenStatus hidden={species.data.hidden}/>}
                    </SelectableSpeciesEntry>
            )}
        </ul>
    </li>
}