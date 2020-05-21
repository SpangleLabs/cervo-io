import React from "react";

interface SearchNoResultsProps {
    searchTerm: string;
}
export const SearchNoResults: React.FunctionComponent<SearchNoResultsProps> = (props) => {
    return <li>No results for "{props.searchTerm}"</li>
}