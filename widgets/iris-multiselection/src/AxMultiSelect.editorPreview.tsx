import { JSX } from "react";
import "./styles/AxMultiSelect.css";

export function preview(): JSX.Element {
    return (
        <div
            className="ax-multiselect-container"
            style={{ width: "100%", padding: "12px", border: "1px dashed #1890ff" }}
        >
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Multi Select List (Preview Mode)</div>
            <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                High performance multi-select widget with 5k-20k virtualization.
            </div>
        </div>
    );
}
