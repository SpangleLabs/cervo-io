import * as React from "react";

const styles = require("./NavTopBar.css")

export const NavTopBar: React.FunctionComponent = () => {
    return <div className={styles.navBar}>
        <a href="faq.html">Frequently asked questions, privacy policy, and terms & conditions</a>
    </div>
}
