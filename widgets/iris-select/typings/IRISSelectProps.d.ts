/**
 * This file was generated from IRISSelect.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListAttributeValue, ListExpressionValue, ListValue } from "mendix";
import { CSSProperties } from "react";

export type OptionsSourceEnum = "attribute" | "datasource";

export type SizeEnum = "medium" | "small" | "large";

export type VariantEnum = "outlined" | "filled" | "borderless" | "underlined";

export interface IRISSelectContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    attribute: EditableValue<string>;
    optionsSource: OptionsSourceEnum;
    optionsDatasource?: ListValue;
    optionValue?: ListAttributeValue<string>;
    optionLabel?: ListExpressionValue<string>;
    placeholder?: DynamicValue<string>;
    showSearch: boolean;
    allowClear: boolean;
    size: SizeEnum;
    variant: VariantEnum;
    onChangeAction?: ActionValue;
}

export interface IRISSelectPreviewProps {
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
    optionsDatasource: {} | { caption: string } | { type: string } | null;
    optionValue: string;
    optionLabel: string;
    placeholder: string;
    showSearch: boolean;
    allowClear: boolean;
    size: SizeEnum;
    variant: VariantEnum;
    onChangeAction: {} | null;
}
