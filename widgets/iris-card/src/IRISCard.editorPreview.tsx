import { ReactElement } from "react";
import { IRISCardPreviewProps } from "../typings/IRISCardProps";

import "./ui/IRISCard.css";

export function preview({ prpTitle }: IRISCardPreviewProps): ReactElement {
    return (
        <div className="iris-card">
            <div className="iris-card__title">{prpTitle || "Card title"}</div>
            <div className="iris-card__count">0 item(s)</div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISCard.css");
}
