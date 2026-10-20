export type GanttScale = "day" | "week" | "month" | "quarter" | "year";

/** A task/block/group, already reduced to plain values from the Mendix datasource. */
export interface GanttTaskRecord {
    id: string;
    /** Parent id, or "" for top level. */
    parent: string;
    text: string;
    /** Business type from the Type attribute, lower-cased (e.g. "block", "group", "task"). */
    irisType: string;
    /** True for Summary Types — rendered as a DHTMLX "project" spanning its children. */
    summary: boolean;
    start: Date;
    end?: Date;
    duration?: number;
    /** 0–100 */
    progress: number;
    order: number;
    color?: string;
    readonly: boolean;
    /** 0 for top-level rows. */
    depth: number;
}

export interface GanttLinkRecord {
    id: string;
    source: string;
    target: string;
    /** DHTMLX link type: "0" FS, "1" SS, "2" FF, "3" SF. */
    type: string;
}

/** Values reported to On Task Change. */
export interface TaskChange {
    taskId: string;
    startDate: Date;
    endDate: Date;
    /** 0–100 */
    progress: number;
    parentId?: string;
    sortOrder: number;
}

export interface LinkCreate {
    sourceId: string;
    targetId: string;
    linkType: string;
}
