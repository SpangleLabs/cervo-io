import React from "react";
import {Spinner} from "@cervoio/common-ui-lib/src/components/images/Spinner";
import classNames from "classnames";

const styles = require("./PostcodeEntry.css")

interface PostcodeEntryProps {
    postcode: string;
    onUpdate: (e: React.FormEvent<HTMLInputElement>) => void;
    error: boolean;
    isLoading: boolean;
}

export const PostcodeEntry: React.FunctionComponent<PostcodeEntryProps> = (props) => {
    const errorClass = classNames(
        styles.error,
        {
            [styles.hidden]: !props.error
        }
    )
    return <>
        <label>
            Enter your postcode to get distances:
            <input id="postcode" type="text" value={props.postcode} onChange={props.onUpdate}/>
        </label>
        <span className={errorClass}>Invalid postcode.</span>
        {props.isLoading ? <Spinner/> : ""}
    </>
}
