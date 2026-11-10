/**
 * This file was generated from AxMultiSelect.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PrpTypeEnum = "multi" | "single" | "onlyView";

export interface AxMultiSelectContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpType: PrpTypeEnum;
    prpHeight: DynamicValue<Big>;
    prpItemHeight: DynamicValue<Big>;
    prpPlaceholder?: DynamicValue<string>;
    prpShowSearch?: DynamicValue<boolean>;
    prpTextSearch?: DynamicValue<string>;
    prpSelectedItems?: DynamicValue<string>;
    prpItems: ListValue;
    prpKeyAttribute: ListAttributeValue<Big | string>;
    prpNameAttribute: ListAttributeValue<string>;
    prpOnChange?: ActionValue<{ selectedKeys: Option<string> }>;
}

export interface AxMultiSelectPreviewProps {
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
    prpType: PrpTypeEnum;
    prpHeight: string;
    prpItemHeight: string;
    prpPlaceholder: string;
    prpShowSearch: string;
    prpTextSearch: string;
    prpSelectedItems: string;
    prpItems: {} | { caption: string } | { type: string } | null;
    prpKeyAttribute: string;
    prpNameAttribute: string;
    prpOnChange: {} | null;
}
