import React from "react";
import {TickBox} from "../TickBox";

interface CategorySelectorProps {
    selectCategory: () => Promise<void> | null;
    selected: boolean;
}

export const CategorySelector: React.FunctionComponent<CategorySelectorProps> = (props) => {
    if (props.selectCategory != null) {
        return <span className="clickable selector" onClick={props.selectCategory}>
                <TickBox selected={props.selected}/>
            </span>
    }
    return null;
}
