import { CSSProperties, ReactElement } from "react";
import { DatePicker } from "antd";
import { Dayjs } from "dayjs";
import { FieldValidation, IrisAntdProvider } from "@iris/antd-kit";
import classNames from "classnames";

import { PickerMode, RANGE_PRESETS, SINGLE_PRESETS } from "./dateUnits";

export interface DatePickerViewProps {
    className?: string;
    style?: CSSProperties;
    tabIndex?: number;
    range: boolean;
    value: Dayjs | null;
    endValue: Dayjs | null;
    picker: PickerMode;
    showTime: boolean;
    format?: string;
    minDate?: Dayjs;
    maxDate?: Dayjs;
    showPresets: boolean;
    placeholder?: string;
    endPlaceholder?: string;
    allowClear: boolean;
    disabled: boolean;
    size: "small" | "medium" | "large";
    variant: "outlined" | "filled" | "borderless" | "underlined";
    fullWidth: boolean;
    validation?: string;
    onChange?: (value: Dayjs | null) => void;
    onRangeChange?: (start: Dayjs | null, end: Dayjs | null) => void;
}

export function DatePickerView(props: DatePickerViewProps): ReactElement {
    // Time and presets only make sense at day granularity.
    const isDate = props.picker === "date";
    const common = {
        className: "iris-datepicker__input",
        picker: props.picker,
        showTime: isDate && props.showTime ? { format: "HH:mm" } : undefined,
        format: props.format || undefined,
        minDate: props.minDate,
        maxDate: props.maxDate,
        allowClear: props.allowClear,
        disabled: props.disabled,
        size: props.size,
        variant: props.variant,
        status: props.validation ? ("error" as const) : undefined,
        tabIndex: props.tabIndex
    };

    return (
        <IrisAntdProvider>
            <div
                className={classNames("iris-datepicker", props.className, {
                    "iris-datepicker--full-width": props.fullWidth
                })}
                style={props.style}
            >
                {props.range ? (
                    <DatePicker.RangePicker
                        {...common}
                        value={[props.value, props.endValue]}
                        allowEmpty={[true, true]}
                        placeholder={
                            props.placeholder || props.endPlaceholder
                                ? [props.placeholder ?? "", props.endPlaceholder ?? ""]
                                : undefined
                        }
                        presets={isDate && props.showPresets ? RANGE_PRESETS() : undefined}
                        onChange={dates => props.onRangeChange?.(dates?.[0] ?? null, dates?.[1] ?? null)}
                    />
                ) : (
                    <DatePicker
                        {...common}
                        value={props.value}
                        placeholder={props.placeholder}
                        presets={isDate && props.showPresets ? SINGLE_PRESETS() : undefined}
                        onChange={date => props.onChange?.(date ?? null)}
                    />
                )}
                <FieldValidation message={props.validation} />
            </div>
        </IrisAntdProvider>
    );
}
