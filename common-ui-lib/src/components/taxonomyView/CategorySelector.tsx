import * as React from "react";
import {TickBox} from "../tickbox";

interface CategorySelectorProps {
    selectCategory: () => Promise<void> | null;
    selected: boolean;
}
interface CategorySelectorState {

}
export class CategorySelector extends React.Component<CategorySelectorProps, CategorySelectorState> {
    render() {
        if(this.props.selectCategory != null) {
            return <span className="clickable selector" onClick={this.props.selectCategory}>
                <TickBox selected={this.props.selected} />
            </span>
        }
        return null;
    }
}