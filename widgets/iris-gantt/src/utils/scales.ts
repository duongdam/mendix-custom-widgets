import type { GanttStatic } from "dhtmlx-gantt";

import { GanttScale } from "../types/GanttTypes";

type ScaleConfig = GanttStatic["config"]["scales"];

function quarterLabel(date: Date): string {
    return `Q${Math.floor(date.getMonth() / 3) + 1}`;
}

/** Two-row timeline headers per zoom level; wider scales = fewer DOM columns to render. */
export function scalesFor(scale: GanttScale): { scales: ScaleConfig; minColumnWidth: number } {
    switch (scale) {
        case "day":
            return {
                scales: [
                    { unit: "month", step: 1, format: "%F %Y" },
                    { unit: "day", step: 1, format: "%d" }
                ],
                minColumnWidth: 28
            };
        case "week":
            return {
                scales: [
                    { unit: "month", step: 1, format: "%F %Y" },
                    { unit: "week", step: 1, format: "W%W" }
                ],
                minColumnWidth: 48
            };
        case "month":
            return {
                scales: [
                    { unit: "year", step: 1, format: "%Y" },
                    { unit: "month", step: 1, format: "%M" }
                ],
                minColumnWidth: 56
            };
        case "quarter":
            return {
                scales: [
                    { unit: "year", step: 1, format: "%Y" },
                    { unit: "quarter", step: 1, format: quarterLabel }
                ],
                minColumnWidth: 64
            };
        case "year":
            return { scales: [{ unit: "year", step: 1, format: "%Y" }], minColumnWidth: 80 };
    }
}
