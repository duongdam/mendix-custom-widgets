/**
 * This file was generated from AxNewDatePicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, Option } from "mendix";
import { CSSProperties } from "react";

export type PrpModeEnum = "single" | "range";

export type PrpPickerEnum = "date" | "week" | "month" | "quarter" | "year";

export type PrpSizeEnum = "small" | "medium" | "large";

export interface AxNewDatePickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpMode: PrpModeEnum;
    prpPicker: PrpPickerEnum;
    prpShowTime: boolean;
    prpShowPresets: boolean;
    prpFormat: string;
    prpAllowClear: boolean;
    prpStartDate?: DynamicValue<Date>;
    prpEndDate?: DynamicValue<Date>;
    prpMinDate?: DynamicValue<Date>;
    prpMaxDate?: DynamicValue<Date>;
    prpPlaceholder?: DynamicValue<string>;
    prpEndPlaceholder?: DynamicValue<string>;
    prpSize: PrpSizeEnum;
    prpFullWidth: boolean;
    prpOnChange?: ActionValue<{ startDate: Option<Date>; endDate: Option<Date> }>;
}

export interface AxNewDatePickerPreviewProps {
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
    prpPicker: PrpPickerEnum;
    prpShowTime: boolean;
    prpShowPresets: boolean;
    prpFormat: string;
    prpAllowClear: boolean;
    prpStartDate: string;
    prpEndDate: string;
    prpMinDate: string;
    prpMaxDate: string;
    prpPlaceholder: string;
    prpEndPlaceholder: string;
    prpSize: PrpSizeEnum;
    prpFullWidth: boolean;
    prpOnChange: {} | null;
}
