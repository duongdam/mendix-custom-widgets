import { ReactElement } from "react";

import "./ui/AxNewCustomTable.css";

export function preview(): ReactElement {
    return (
        <div className="ax-custom-table-container" style={{ padding: "12px", border: "1px dashed #1677ff" }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Ax New Custom Table (Preview Mode)</div>
            <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                Dynamic data table with server-driven pagination and search.
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/AxNewCustomTable.css");
}
