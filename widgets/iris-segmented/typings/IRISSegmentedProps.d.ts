/**
 * This file was generated from IRISSegmented.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { CSSProperties } from "react";

export type PrpOptionsSourceEnum = "attribute" | "static";

export interface PrpStaticOptionsType {
    prpValue: string;
    prpCaption?: DynamicValue<string>;
}

export type PrpSizeEnum = "medium" | "small" | "large";

export interface PrpStaticOptionsPreviewType {
    prpValue: string;
    prpCaption: string;
}

export interface IRISSegmentedContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpAttribute: EditableValue<string>;
    prpOptionsSource: PrpOptionsSourceEnum;
    prpStaticOptions: PrpStaticOptionsType[];
    prpSize: PrpSizeEnum;
    prpBlock: boolean;
    prpVertical: boolean;
    prpOnChange?: ActionValue;
}

export interface IRISSegmentedPreviewProps {
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
    prpAttribute: string;
    prpOptionsSource: PrpOptionsSourceEnum;
    prpStaticOptions: PrpStaticOptionsPreviewType[];
    prpSize: PrpSizeEnum;
    prpBlock: boolean;
    prpVertical: boolean;
    prpOnChange: {} | null;
}
