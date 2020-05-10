import * as React from "react";

const style = require("./SearchHilightedText.css")

interface HilightedTextProps {
    text: string;
    searchTerm: string;
}
export class SearchHilightedText extends React.Component<HilightedTextProps, {}> {
    render() {
        const searchRegex = new RegExp(this.props.searchTerm, "gi");
        this.props.text.split(searchRegex);

        let split = this.props.text.split(searchRegex);
        let replacements = this.props.text.match(searchRegex);
        let result = [];
        for (let i = 0; i < split.length - 1; i++) {
            result.push(split[i]);
            result.push(<span className={style.searchTerm}>{replacements[i]}</span>);
        }
        result.push(split[split.length - 1]);
        return result;
    }
}