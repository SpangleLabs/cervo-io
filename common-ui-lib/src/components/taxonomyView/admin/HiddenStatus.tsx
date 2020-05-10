import * as React from "react";


interface HiddenStatusProps {
    hidden: boolean
}

export const HiddenStatus: React.FunctionComponent<HiddenStatusProps> = (props) => {
    return <>{props.hidden ? "⛔" : "👁️"}</>
}
