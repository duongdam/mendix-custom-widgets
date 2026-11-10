/**
 * This file was generated from AxNewSelecter.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PrpModeEnum = "single" | "multiple";

export type PrpSizeEnum = "small" | "medium" | "large";

export interface AxNewSelecterContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpMode: PrpModeEnum;
    prpPlaceholder?: DynamicValue<string>;
    prpShowSearch: boolean;
    prpAllowClear: boolean;
    prpSize: PrpSizeEnum;
    prpSelectedItems?: DynamicValue<string>;
    prpItems: ListValue;
    prpKeyAttribute: ListAttributeValue<Big | string>;
    prpNameAttribute: ListAttributeValue<string>;
    prpOnChange?: ActionValue<{ selectedKeys: Option<string> }>;
}

export interface AxNewSelecterPreviewProps {
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
    prpMode: PrpModeEnum;
    prpPlaceholder: string;
    prpShowSearch: boolean;
    prpAllowClear: boolean;
    prpSize: PrpSizeEnum;
    prpSelectedItems: string;
    prpItems: {} | { caption: string } | { type: string } | null;
    prpKeyAttribute: string;
    prpNameAttribute: string;
    prpOnChange: {} | null;
}
