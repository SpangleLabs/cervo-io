import React from "react";

const style = require("./SearchHilightedText.css")

interface HilightedTextProps {
    text: string;
    searchTerm: string;
}

export const SearchHilightedText: React.FunctionComponent<HilightedTextProps> = (props) => {
    const searchRegex = new RegExp(props.searchTerm, "gi");
    let split = props.text.split(searchRegex);
    let replacements = props.text.match(searchRegex);
    let result: JSX.Element[] = [];
    if (replacements !== null) {
        for (let i = 0; i < split.length - 1; i++) {
            result.push(<span key={2 * i}>{split[i]}</span>);
            result.push(<span key={2 * i + 1} className={style.searchTerm}>{replacements[i]}</span>);
        }
    }
    result.push(<span key={split.length * 2}>{split[split.length - 1]}</span>);
    return <>{result}</>;
}
