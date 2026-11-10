/**
 * This file was generated from IRISGantt.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PrpScaleEnum = "day" | "week" | "month" | "quarter" | "year";

export type PrpDurationUnitEnum = "day" | "hour";

export interface IRISGanttContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpTasks: ListValue;
    prpTaskIdAttr: ListAttributeValue<string | Big>;
    prpTaskParentIdAttr?: ListAttributeValue<string | Big>;
    prpTaskTextAttr: ListAttributeValue<string>;
    prpTaskTypeAttr?: ListAttributeValue<string>;
    prpTaskStartAttr: ListAttributeValue<Date>;
    prpTaskEndAttr?: ListAttributeValue<Date>;
    prpTaskDurationAttr?: ListAttributeValue<Big>;
    prpTaskProgressAttr?: ListAttributeValue<Big>;
    prpTaskOrderAttr?: ListAttributeValue<Big>;
    prpTaskColorAttr?: ListAttributeValue<string>;
    prpTaskReadOnlyAttr?: ListAttributeValue<boolean>;
    prpLinks?: ListValue;
    prpLinkIdAttr?: ListAttributeValue<string | Big>;
    prpLinkSourceAttr?: ListAttributeValue<string | Big>;
    prpLinkTargetAttr?: ListAttributeValue<string | Big>;
    prpLinkTypeAttr?: ListAttributeValue<string>;
    prpSummaryTypes: string;
    prpTypeHierarchy: string;
    prpOpenLevel: number;
    prpAllowDragMove: boolean;
    prpAllowResize: boolean;
    prpAllowProgressDrag: boolean;
    prpAllowReorder: boolean;
    prpAllowLinkEdit: boolean;
    prpOnTaskChange?: ActionValue<{
        taskId: Option<string>;
        startDate: Option<Date>;
        endDate: Option<Date>;
        progress: Option<Big>;
        parentId: Option<string>;
        sortOrder: Option<Big>;
    }>;
    prpOnLinkCreate?: ActionValue<{ sourceId: Option<string>; targetId: Option<string>; linkType: Option<string> }>;
    prpOnLinkDelete?: ActionValue<{ linkId: Option<string> }>;
    prpOnTaskClick?: ActionValue<{ taskId: Option<string> }>;
    prpOnTaskDoubleClick?: ActionValue<{ taskId: Option<string> }>;
    prpSelectedTaskIdAttr?: EditableValue<string>;
    prpScale: PrpScaleEnum;
    prpDurationUnit: PrpDurationUnitEnum;
    prpShowToolbar: boolean;
    prpLocale: string;
    prpHeight: string;
    prpShowStartColumn: boolean;
    prpShowDurationColumn: boolean;
    prpShowProgress: boolean;
    prpLogPerformance: boolean;
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
    prpTasks: {} | { caption: string } | { type: string } | null;
    prpTaskIdAttr: string;
    prpTaskParentIdAttr: string;
    prpTaskTextAttr: string;
    prpTaskTypeAttr: string;
    prpTaskStartAttr: string;
    prpTaskEndAttr: string;
    prpTaskDurationAttr: string;
    prpTaskProgressAttr: string;
    prpTaskOrderAttr: string;
    prpTaskColorAttr: string;
    prpTaskReadOnlyAttr: string;
    prpLinks: {} | { caption: string } | { type: string } | null;
    prpLinkIdAttr: string;
    prpLinkSourceAttr: string;
    prpLinkTargetAttr: string;
    prpLinkTypeAttr: string;
    prpSummaryTypes: string;
    prpTypeHierarchy: string;
    prpOpenLevel: number | null;
    prpAllowDragMove: boolean;
    prpAllowResize: boolean;
    prpAllowProgressDrag: boolean;
    prpAllowReorder: boolean;
    prpAllowLinkEdit: boolean;
    prpOnTaskChange: {} | null;
    prpOnLinkCreate: {} | null;
    prpOnLinkDelete: {} | null;
    prpOnTaskClick: {} | null;
    prpOnTaskDoubleClick: {} | null;
    prpSelectedTaskIdAttr: string;
    prpScale: PrpScaleEnum;
    prpDurationUnit: PrpDurationUnitEnum;
    prpShowToolbar: boolean;
    prpLocale: string;
    prpHeight: string;
    prpShowStartColumn: boolean;
    prpShowDurationColumn: boolean;
    prpShowProgress: boolean;
    prpLogPerformance: boolean;
}
