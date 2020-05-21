import React from "react";

const styles = require("./LatinName.css")

interface LatinNameProps {
}

export const LatinName: React.FunctionComponent<LatinNameProps> = (props) => {
    return <>
        <span className={styles.latinName}>{props.children}</span>
    </>

}