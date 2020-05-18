import {TaxonomyCategoryState} from "../../../taxonomyState";
import {NewSpeciesJson} from "@cervoio/common-lib/src/apiInterfaces";
import React, {useState} from "react";
import {ChangeEvent, FormEvent} from "react";

interface AddSpeciesFormProps {
    parentCategory: TaxonomyCategoryState;
    addSpecies: (newSpecies: NewSpeciesJson) => Promise<void>;
}
export const AddSpeciesForm: React.FunctionComponent<AddSpeciesFormProps> = (props) => {
    const starterLatinName = props.parentCategory.data.name + " ";
    const [commonName, setCommonName] = useState("")
    const [latinName, setLatinName] = useState(starterLatinName)
    const [hidden, setHidden] = useState(true)

    const onChangeCommonName = (event: ChangeEvent<HTMLInputElement>) => {
        let newCommonName = event.target.value;
        if (newCommonName.length > 0) {
            newCommonName = newCommonName[0].toUpperCase() + newCommonName.substr(1);
        }
        setCommonName(newCommonName)
    }

    const onChangeLatinName = (event: ChangeEvent<HTMLInputElement>) => {
        setLatinName(event.target.value.toLowerCase())
    }

    const onChangeHidden = (event: ChangeEvent<HTMLInputElement>) => {
        setHidden(event.target.checked)
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newSpecies: NewSpeciesJson = {
            common_name: commonName,
            latin_name: latinName,
            category_id: props.parentCategory.data.id,
            hidden: hidden
        };
        await props.addSpecies(newSpecies);
        const starterLatinName = props.parentCategory.data.name + " ";
        setCommonName("")
        setLatinName(starterLatinName)
        setHidden(true)
    }

    return <li>
        <span>Add species </span>
        <form onSubmit={onSubmit}>
            <input type='text' placeholder='Common name' value={commonName} onChange={onChangeCommonName} />
            <input type='text' placeholder='latin name' value={latinName} onChange={onChangeLatinName} />
            <label>Hidden?<input type='checkbox' checked={hidden} onChange={onChangeHidden} /></label>
            <input type='submit'/>
        </form>
    </li>
}
