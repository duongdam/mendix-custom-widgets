/**
 * This file was generated from IRISProgress.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PrpProgressTypeEnum = "line" | "circle" | "dashboard";

export type PrpStatusEnum = "auto" | "normal" | "active" | "success" | "exception";

export type PrpLineSizeEnum = "medium" | "small";

export interface IRISProgressContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpValue: DynamicValue<Big>;
    prpMaxValue?: DynamicValue<Big>;
    prpSuccessValue?: DynamicValue<Big>;
    prpProgressType: PrpProgressTypeEnum;
    prpShowInfo: boolean;
    prpLabel?: DynamicValue<string>;
    prpStatus: PrpStatusEnum;
    prpExceptionWhen?: DynamicValue<boolean>;
    prpLineSize: PrpLineSizeEnum;
    prpCircleSize: number;
    prpSteps: number;
    prpStrokeColor?: DynamicValue<string>;
    prpOnClick?: ActionValue;
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
    prpValue: string;
    prpMaxValue: string;
    prpSuccessValue: string;
    prpProgressType: PrpProgressTypeEnum;
    prpShowInfo: boolean;
    prpLabel: string;
    prpStatus: PrpStatusEnum;
    prpExceptionWhen: string;
    prpLineSize: PrpLineSizeEnum;
    prpCircleSize: number | null;
    prpSteps: number | null;
    prpStrokeColor: string;
    prpOnClick: {} | null;
}
