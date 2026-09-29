/**
 * This file was generated from IRISProgress.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type ProgressTypeEnum = "line" | "circle" | "dashboard";

export type StatusEnum = "auto" | "normal" | "active" | "success" | "exception";

export type LineSizeEnum = "medium" | "small";

export type StrokeLinecapEnum = "round" | "square" | "butt";

export interface IRISProgressContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    value: DynamicValue<Big>;
    maxValue?: DynamicValue<Big>;
    successValue?: DynamicValue<Big>;
    progressType: ProgressTypeEnum;
    showInfo: boolean;
    label?: DynamicValue<string>;
    status: StatusEnum;
    exceptionWhen?: DynamicValue<boolean>;
    lineSize: LineSizeEnum;
    circleSize: number;
    steps: number;
    strokeColor?: DynamicValue<string>;
    railColor?: DynamicValue<string>;
    strokeLinecap: StrokeLinecapEnum;
    onClick?: ActionValue;
}

export interface IRISProgressPreviewProps {
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
    value: string;
    maxValue: string;
    successValue: string;
    progressType: ProgressTypeEnum;
    showInfo: boolean;
    label: string;
    status: StatusEnum;
    exceptionWhen: string;
    lineSize: LineSizeEnum;
    circleSize: number | null;
    steps: number | null;
    strokeColor: string;
    railColor: string;
    strokeLinecap: StrokeLinecapEnum;
    onClick: {} | null;
}
