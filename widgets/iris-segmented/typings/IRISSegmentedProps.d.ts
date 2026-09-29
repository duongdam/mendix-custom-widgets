/**
 * This file was generated from IRISSegmented.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { CSSProperties } from "react";

export type OptionsSourceEnum = "attribute" | "static";

export interface StaticOptionsType {
    value: string;
    caption?: DynamicValue<string>;
}

export type SizeEnum = "medium" | "small" | "large";

export interface StaticOptionsPreviewType {
    value: string;
    caption: string;
}

export interface IRISSegmentedContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    attribute: EditableValue<string>;
    optionsSource: OptionsSourceEnum;
    staticOptions: StaticOptionsType[];
    size: SizeEnum;
    block: boolean;
    vertical: boolean;
    onChangeAction?: ActionValue;
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
    attribute: string;
    optionsSource: OptionsSourceEnum;
    staticOptions: StaticOptionsPreviewType[];
    size: SizeEnum;
    block: boolean;
    vertical: boolean;
    onChangeAction: {} | null;
}
