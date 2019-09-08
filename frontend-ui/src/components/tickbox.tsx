import * as React from "react";

export interface IsSelected {
    selected: boolean
}

export class TickBox extends React.Component<IsSelected, {}> {
    render() {
        return <img
            src={this.props.selected ? "images/box_checked.svg" : "images/box_unchecked.svg"}
            alt={this.props.selected ? "✔" : "➕"}
        />
    }
}