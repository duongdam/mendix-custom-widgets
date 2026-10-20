import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";

import { GanttStore } from "../store/GanttStore";
import { GanttScale } from "../types/GanttTypes";

const SCALES: Array<{ value: GanttScale; label: string }> = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "quarter", label: "Quarter" },
    { value: "year", label: "Year" }
];

interface GanttToolbarProps {
    store: GanttStore;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onToday: () => void;
}

function GanttToolbarComponent({ store, onExpandAll, onCollapseAll, onToday }: GanttToolbarProps): ReactElement {
    return (
        <div className="iris-gantt__toolbar" role="toolbar">
            <div className="iris-gantt__toolbar-group" role="group" aria-label="Scale">
                {SCALES.map(scale => (
                    <button
                        key={scale.value}
                        type="button"
                        className={classNames("iris-gantt__button", {
                            "iris-gantt__button--active": store.scale === scale.value
                        })}
                        aria-pressed={store.scale === scale.value}
                        onClick={() => store.setScale(scale.value)}
                    >
                        {scale.label}
                    </button>
                ))}
            </div>
            <div className="iris-gantt__toolbar-group">
                <button type="button" className="iris-gantt__button" onClick={onExpandAll}>
                    Expand all
                </button>
                <button type="button" className="iris-gantt__button" onClick={onCollapseAll}>
                    Collapse all
                </button>
                <button type="button" className="iris-gantt__button" onClick={onToday}>
                    Today
                </button>
            </div>
        </div>
    );
}

export const GanttToolbar = observer(GanttToolbarComponent);
