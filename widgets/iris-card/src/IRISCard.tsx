import { ReactElement } from "react";
import { IRISCardContainerProps } from "../typings/IRISCardProps";

import "./ui/IRISCard.css";

export function IRISCard({ prpTitle, prpItems }: IRISCardContainerProps): ReactElement {
    const isLoading = prpTitle.status === "loading" || prpItems?.status === "loading";
    const count = prpItems?.items?.length ?? 0;

    return (
        <div className="iris-card">
            <input
                className="iris-card__title"
                value={prpTitle.value ?? ""}
                readOnly={prpTitle.readOnly}
                onChange={event => prpTitle.setValue(event.target.value)}
            />
            <div className="iris-card__count">{isLoading ? "Loading…" : `${count} item(s)`}</div>
        </div>
    );
}
