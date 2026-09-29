/**
 * This file was generated from IRISDatePicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { CSSProperties } from "react";

export type PickerEnum = "date" | "week" | "month" | "quarter" | "year";

export type SizeEnum = "medium" | "small" | "large";

export type VariantEnum = "outlined" | "filled" | "borderless" | "underlined";

export interface IRISDatePickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    startAttribute: EditableValue<Date>;
    endAttribute?: EditableValue<Date>;
    picker: PickerEnum;
    showTime: boolean;
    format: string;
    minDate?: DynamicValue<Date>;
    maxDate?: DynamicValue<Date>;
    showPresets: boolean;
    placeholder?: DynamicValue<string>;
    endPlaceholder?: DynamicValue<string>;
    allowClear: boolean;
    size: SizeEnum;
    variant: VariantEnum;
    fullWidth: boolean;
    onChangeAction?: ActionValue;
}

export interface IRISDatePickerPreviewProps {
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
    startAttribute: string;
    endAttribute: string;
    picker: PickerEnum;
    showTime: boolean;
    format: string;
    minDate: string;
    maxDate: string;
    showPresets: boolean;
    placeholder: string;
    endPlaceholder: string;
    allowClear: boolean;
    size: SizeEnum;
    variant: VariantEnum;
    fullWidth: boolean;
    onChangeAction: {} | null;
}
