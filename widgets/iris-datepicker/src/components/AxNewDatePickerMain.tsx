import { CSSProperties, ReactElement } from "react";
import { DatePicker } from "antd";
import { Dayjs } from "dayjs";
import classNames from "classnames";

import { PickerMode, RANGE_PRESETS, SINGLE_PRESETS } from "./dateUnits";

export interface AxNewDatePickerMainProps {
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
    fullWidth: boolean;
    onChange?: (value: Dayjs | null) => void;
    onRangeChange?: (start: Dayjs | null, end: Dayjs | null) => void;
}

export function AxNewDatePickerMain(props: AxNewDatePickerMainProps): ReactElement {
    // Time and presets only make sense at day granularity.
    const isDate = props.picker === "date";
    const common = {
        className: "ax-new-datepicker__input",
        picker: props.picker,
        showTime: isDate && props.showTime ? { format: "HH:mm" } : undefined,
        format: props.format || undefined,
        minDate: props.minDate,
        maxDate: props.maxDate,
        allowClear: props.allowClear,
        disabled: props.disabled,
        size: props.size,
        tabIndex: props.tabIndex
    };

    return (
        <div
            className={classNames("ax-new-datepicker", props.className, {
                "ax-new-datepicker--full-width": props.fullWidth
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
        </div>
    );
}
