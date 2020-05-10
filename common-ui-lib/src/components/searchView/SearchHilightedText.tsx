import * as React from "react";

const style = require("./SearchHilightedText.css")

interface HilightedTextProps {
    text: string;
    searchTerm: string;
}

export const SearchHilightedText: React.FunctionComponent<HilightedTextProps> = (props) => {
    const searchRegex = new RegExp(props.searchTerm, "gi");
    let split = props.text.split(searchRegex);
    let replacements = props.text.match(searchRegex);
    let result = [];
    for (let i = 0; i < split.length - 1; i++) {
        result.push(split[i]);
        result.push(<span className={style.searchTerm}>{replacements[i]}</span>);
    }
    result.push(split[split.length - 1]);
    return <>result</>;
}
