import { ReactElement, useCallback, useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { ValueStatus } from "mendix";

import { AxNewDatePickerContainerProps } from "../typings/AxNewDatePickerProps";
import { AxNewDatePickerMain } from "./components/AxNewDatePickerMain";
import { endOfUnit, startOfUnit, toDayjs } from "./components/dateUnits";

import "./ui/AxNewDatePicker.css";

function dateOf(value: { status: string; value?: Date } | undefined): Date | undefined {
    return value?.status === ValueStatus.Available ? value.value : undefined;
}

function textOf(value: { status: string; value?: string } | undefined): string | undefined {
    return (value?.status === ValueStatus.Available ? value.value : undefined) || undefined;
}

export function AxNewDatePicker(props: AxNewDatePickerContainerProps): ReactElement {
    const { prpPicker: picker, prpOnChange, prpStartDate, prpEndDate } = props;
    
    const range = props.prpMode === "range";
    const keepTime = picker === "date" && props.prpShowTime;

    const [start, setStart] = useState<Date | undefined>(() => dateOf(prpStartDate));
    const [end, setEnd] = useState<Date | undefined>(() => dateOf(prpEndDate));

    // Sync from the expressions when they change from outside (e.g. a microflow sets the attribute).
    // Compared by timestamp, so the echo of our own change is a no-op.
    const externalStart = dateOf(prpStartDate)?.getTime();
    const externalEnd = dateOf(prpEndDate)?.getTime();

    useEffect(() => {
        setStart(prev =>
            prev?.getTime() === externalStart ? prev : externalStart === undefined ? undefined : new Date(externalStart)
        );
    }, [externalStart]);

    useEffect(() => {
        setEnd(prev =>
            prev?.getTime() === externalEnd ? prev : externalEnd === undefined ? undefined : new Date(externalEnd)
        );
    }, [externalEnd]);

    const normalizeStart = useCallback(
        (date: Dayjs | null): Date | undefined =>
            date ? (keepTime ? date : startOfUnit(date, picker)).toDate() : undefined,
        [keepTime, picker]
    );

    const normalizeEnd = useCallback(
        (date: Dayjs | null): Date | undefined =>
            date ? (keepTime ? date : endOfUnit(date, picker)).toDate() : undefined,
        [keepTime, picker]
    );

    const commit = useCallback(
        (startDate: Date | undefined, endDate: Date | undefined): void => {
            setStart(startDate);
            setEnd(endDate);
            if (prpOnChange?.canExecute && !prpOnChange.isExecuting) {
                prpOnChange.execute({ startDate, endDate });
            }
        },
        [prpOnChange]
    );

    const handleChange = useCallback(
        (date: Dayjs | null) => commit(normalizeStart(date), undefined),
        [commit, normalizeStart]
    );

    const handleRangeChange = useCallback(
        (s: Dayjs | null, e: Dayjs | null) => commit(normalizeStart(s), normalizeEnd(e)),
        [commit, normalizeStart, normalizeEnd]
    );

    return (
        <AxNewDatePickerMain
            className={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            range={range}
            value={toDayjs(start)}
            endValue={toDayjs(end)}
            picker={picker}
            showTime={props.prpShowTime}
            format={props.prpFormat}
            minDate={toDayjs(dateOf(props.prpMinDate)) ?? undefined}
            maxDate={toDayjs(dateOf(props.prpMaxDate)) ?? undefined}
            showPresets={props.prpShowPresets}
            placeholder={textOf(props.prpPlaceholder)}
            endPlaceholder={textOf(props.prpEndPlaceholder)}
            allowClear={props.prpAllowClear}
            disabled={false}
            size={props.prpSize}
            fullWidth={props.prpFullWidth}
            onChange={handleChange}
            onRangeChange={handleRangeChange}
        />
    );
}
