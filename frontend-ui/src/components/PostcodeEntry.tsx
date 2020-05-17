import * as React from "react";
import {Spinner} from "@cervoio/common-ui-lib/src/components/images/Spinner";
import classNames from "classnames";

const styles = require("./PostcodeEntry.css")

interface PostcodeEntryProps {
    postcode: string;
    onUpdate: (e: React.FormEvent<HTMLInputElement>) => void;
    error: boolean;
    isLoading: boolean;
}
export class PostcodeEntry extends React.Component<PostcodeEntryProps, {}> {
    constructor(props: PostcodeEntryProps) {
        super(props);
    }

    render() {
        const errorClass = classNames(
            styles.error,
            {
                [styles.hidden]: !this.props.error
            }
        )
        return <>
            <label>
                Enter your postcode to get distances to selected zoos:
                <input id="postcode" type="text" value={this.props.postcode} onChange={this.props.onUpdate} />
            </label>
            <span className={errorClass}>Invalid postcode.</span>
            {this.props.isLoading ? <Spinner /> : ""}
        </>
    }
}
