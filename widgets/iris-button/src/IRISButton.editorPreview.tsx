import { ReactElement } from "react";
import { IRISButtonPreviewProps } from "../typings/IRISButtonProps";

import "./ui/IRISButton.css";

export function preview({ caption, variant }: IRISButtonPreviewProps): ReactElement {
    return <button className={`iris-button iris-button--${variant}`}>{caption || "Button"}</button>;
}

export function getPreviewCss(): string {
    return require("./ui/IRISButton.css");
}
