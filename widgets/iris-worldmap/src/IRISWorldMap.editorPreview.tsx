import { ReactElement } from "react";

import "./styles/IRISWorldMap.css";

export function preview(): ReactElement {
    return (
        <div className="iris-worldmap" style={{ padding: 12, border: "1px dashed #1428A0" }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>IRIS World Map (Preview Mode)</div>
            <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                Renders Regions as markers on a world map, with optional connection lines.
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./styles/IRISWorldMap.css");
}
