import { ReactElement } from "react";
import { Dayjs } from "dayjs";
import { executeAction, isEditable, validationOf, valueOrUndefined } from "@iris/antd-kit";

import { IRISDatePickerContainerProps } from "../typings/IRISDatePickerProps";
import { DatePickerView } from "./components/DatePickerView";
import { endOfUnit, startOfUnit, toDayjs } from "./components/dateUnits";

import "./ui/IRISDatePicker.css";

export function IRISDatePicker(props: IRISDatePickerContainerProps): ReactElement {
    const { startAttribute, endAttribute, picker } = props;
    const range = !!endAttribute;
    const keepTime = picker === "date" && props.showTime;
    const editable = isEditable(startAttribute) && (!endAttribute || isEditable(endAttribute));

    const normalizeStart = (date: Dayjs | null): Date | undefined =>
        date ? (keepTime ? date : startOfUnit(date, picker)).toDate() : undefined;
    const normalizeEnd = (date: Dayjs | null): Date | undefined =>
        date ? (keepTime ? date : endOfUnit(date, picker)).toDate() : undefined;

    const handleChange = (date: Dayjs | null): void => {
        if (!editable) {
            return;
        }
        startAttribute.setValue(normalizeStart(date));
        executeAction(props.onChangeAction);
    };

    const handleRangeChange = (start: Dayjs | null, end: Dayjs | null): void => {
        if (!editable || !endAttribute) {
            return;
        }
        startAttribute.setValue(normalizeStart(start));
        endAttribute.setValue(normalizeEnd(end));
        executeAction(props.onChangeAction);
    };

    const minDate = valueOrUndefined(props.minDate);
    const maxDate = valueOrUndefined(props.maxDate);

    return (
        <DatePickerView
            className={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            range={range}
            value={toDayjs(startAttribute.value)}
            endValue={toDayjs(endAttribute?.value)}
            picker={picker}
            showTime={props.showTime}
            format={props.format}
            minDate={toDayjs(minDate) ?? undefined}
            maxDate={toDayjs(maxDate) ?? undefined}
            showPresets={props.showPresets}
            placeholder={valueOrUndefined(props.placeholder) || undefined}
            endPlaceholder={valueOrUndefined(props.endPlaceholder) || undefined}
            allowClear={props.allowClear}
            disabled={!editable}
            size={props.size}
            variant={props.variant}
            fullWidth={props.fullWidth}
            validation={validationOf(startAttribute) ?? validationOf(endAttribute)}
            onChange={handleChange}
            onRangeChange={handleRangeChange}
        />
    );
}
