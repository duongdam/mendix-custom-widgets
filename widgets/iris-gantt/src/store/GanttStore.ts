import { makeAutoObservable } from "mobx";

import { GanttScale } from "../types/GanttTypes";

// Task/link data deliberately does NOT live here: 10k records in MobX observables would add
// proxy overhead for no benefit — GanttSync hands plain arrays straight to GanttView, which
// diffs them into DHTMLX. The store only holds UI state shared by toolbar and chart.
export class GanttStore {
    scale: GanttScale;
    selectedTaskId: string | undefined = undefined;

    constructor(scale: GanttScale) {
        this.scale = scale;
        makeAutoObservable(this);
    }

    setScale(scale: GanttScale): void {
        this.scale = scale;
    }

    setSelectedTaskId(id: string | undefined): void {
        this.selectedTaskId = id;
    }
}
