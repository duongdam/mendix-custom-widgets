import { ReactElement } from "react";
import { IRISCardContainerProps } from "../typings/IRISCardProps";

import "./ui/IRISCard.css";

export function IRISCard({ title, items }: IRISCardContainerProps): ReactElement {
    const isLoading = title.status === "loading" || items?.status === "loading";
    const count = items?.items?.length ?? 0;

    return (
        <div className="iris-card">
            <input
                className="iris-card__title"
                value={title.value ?? ""}
                readOnly={title.readOnly}
                onChange={event => title.setValue(event.target.value)}
            />
            <div className="iris-card__count">{isLoading ? "Loading…" : `${count} item(s)`}</div>
        </div>
    );
}
