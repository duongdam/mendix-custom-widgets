import { ReactElement } from "react";

import "./styles/IRISGantt.css";

export function preview(): ReactElement {
    return (
        <div className="iris-gantt" style={{ padding: 12, border: "1px dashed #1677ff" }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>IRIS Gantt (Preview Mode)</div>
            <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                DHTMLX Gantt with Block &gt; Group &gt; Task hierarchy, drag &amp; drop editing and smart rendering.
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./styles/IRISGantt.css");
}
