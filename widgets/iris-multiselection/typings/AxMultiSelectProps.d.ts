/**
 * This file was generated from AxMultiSelect.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type TypeEnum = "multi" | "single" | "onlyView";

export interface AxMultiSelectContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpHeight: DynamicValue<Big>;
    prpItemHeight: DynamicValue<Big>;
    prpPlaceholder?: DynamicValue<string>;
    prpShowSearch?: DynamicValue<boolean>;
    prpTextSearch?: DynamicValue<string>;
    type: TypeEnum;
    prpSelectedItems?: DynamicValue<string>;
    items: ListValue;
    keyAttribute: ListAttributeValue<Big | string>;
    nameAttribute: ListAttributeValue<string>;
    onChange?: ActionValue<{ selectedKeys: Option<string> }>;
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
    prpHeight: string;
    prpItemHeight: string;
    prpPlaceholder: string;
    prpShowSearch: string;
    prpTextSearch: string;
    type: TypeEnum;
    prpSelectedItems: string;
    items: {} | { caption: string } | { type: string } | null;
    keyAttribute: string;
    nameAttribute: string;
    onChange: {} | null;
}
