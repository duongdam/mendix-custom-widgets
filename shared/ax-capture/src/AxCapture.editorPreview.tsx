import { ReactElement } from "react";

import "./ui/AxCapture.css";

export function preview(): ReactElement {
    return (
        <button type="button" className="ax-capture-button" disabled>
            Capture
        </button>
    );
}

export function getPreviewCss(): string {
    return require("./ui/AxCapture.css");
}
