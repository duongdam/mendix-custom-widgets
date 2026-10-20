/**
 * This file was generated from IRISGantt.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type ScaleEnum = "day" | "week" | "month" | "quarter" | "year";

export type DurationUnitEnum = "day" | "hour";

export interface IRISGanttContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    tasks: ListValue;
    taskIdAttr: ListAttributeValue<string | Big>;
    taskParentIdAttr?: ListAttributeValue<string | Big>;
    taskTextAttr: ListAttributeValue<string>;
    taskTypeAttr?: ListAttributeValue<string>;
    taskStartAttr: ListAttributeValue<Date>;
    taskEndAttr?: ListAttributeValue<Date>;
    taskDurationAttr?: ListAttributeValue<Big>;
    taskProgressAttr?: ListAttributeValue<Big>;
    taskOrderAttr?: ListAttributeValue<Big>;
    taskColorAttr?: ListAttributeValue<string>;
    taskReadOnlyAttr?: ListAttributeValue<boolean>;
    summaryTypes: string;
    typeHierarchy: string;
    openLevel: number;
    links?: ListValue;
    linkIdAttr?: ListAttributeValue<string | Big>;
    linkSourceAttr?: ListAttributeValue<string | Big>;
    linkTargetAttr?: ListAttributeValue<string | Big>;
    linkTypeAttr?: ListAttributeValue<string>;
    allowDragMove: boolean;
    allowResize: boolean;
    allowProgressDrag: boolean;
    allowReorder: boolean;
    allowLinkEdit: boolean;
    onTaskChange?: ActionValue<{
        taskId: Option<string>;
        startDate: Option<Date>;
        endDate: Option<Date>;
        progress: Option<Big>;
        parentId: Option<string>;
        sortOrder: Option<Big>;
    }>;
    onLinkCreate?: ActionValue<{ sourceId: Option<string>; targetId: Option<string>; linkType: Option<string> }>;
    onLinkDelete?: ActionValue<{ linkId: Option<string> }>;
    onTaskClick?: ActionValue<{ taskId: Option<string> }>;
    onTaskDoubleClick?: ActionValue<{ taskId: Option<string> }>;
    selectedTaskIdAttr?: EditableValue<string>;
    scale: ScaleEnum;
    durationUnit: DurationUnitEnum;
    showToolbar: boolean;
    locale: string;
    height: string;
    gridWidth: number;
    rowHeight: number;
    showStartColumn: boolean;
    showDurationColumn: boolean;
    showProgress: boolean;
    logPerformance: boolean;
}

export interface IRISGanttPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    tasks: {} | { caption: string } | { type: string } | null;
    taskIdAttr: string;
    taskParentIdAttr: string;
    taskTextAttr: string;
    taskTypeAttr: string;
    taskStartAttr: string;
    taskEndAttr: string;
    taskDurationAttr: string;
    taskProgressAttr: string;
    taskOrderAttr: string;
    taskColorAttr: string;
    taskReadOnlyAttr: string;
    summaryTypes: string;
    typeHierarchy: string;
    openLevel: number | null;
    links: {} | { caption: string } | { type: string } | null;
    linkIdAttr: string;
    linkSourceAttr: string;
    linkTargetAttr: string;
    linkTypeAttr: string;
    allowDragMove: boolean;
    allowResize: boolean;
    allowProgressDrag: boolean;
    allowReorder: boolean;
    allowLinkEdit: boolean;
    onTaskChange: {} | null;
    onLinkCreate: {} | null;
    onLinkDelete: {} | null;
    onTaskClick: {} | null;
    onTaskDoubleClick: {} | null;
    selectedTaskIdAttr: string;
    scale: ScaleEnum;
    durationUnit: DurationUnitEnum;
    showToolbar: boolean;
    locale: string;
    height: string;
    gridWidth: number | null;
    rowHeight: number | null;
    showStartColumn: boolean;
    showDurationColumn: boolean;
    showProgress: boolean;
    logPerformance: boolean;
}
