import { useMemo, useState } from "react";
import type { ActionValue, Option } from "mendix";

import { AxNewDatePicker } from "../../widgets/iris-datepicker/src/AxNewDatePicker";
import type { PrpPickerEnum } from "../../widgets/iris-datepicker/typings/AxNewDatePickerProps";
import { createDynamicValue } from "./mocks/mendixMocks";

type ChangeAction = ActionValue<{ startDate: Option<Date>; endDate: Option<Date> }>;

const PICKERS: PrpPickerEnum[] = ["date", "week", "month", "quarter", "year"];

function show(date: Date | null | undefined): string {
    return date ? date.toLocaleString() : "empty";
}

function createChangeAction(fn: (startDate: Date | undefined, endDate: Date | undefined) => void): ChangeAction {
    return {
        canExecute: true,
        isExecuting: false,
        execute: ({ startDate, endDate }: { startDate: Option<Date>; endDate: Option<Date> }) =>
            fn(startDate ?? undefined, endDate ?? undefined),
    } as unknown as ChangeAction;
}

export function AxNewDatePickerDemo() {
    // The "attribute" values the microflow would write; they are fed back via the expressions.
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [start, setStart] = useState<Date | undefined>();
    const [end, setEnd] = useState<Date | undefined>();
    const [picker, setPicker] = useState<PrpPickerEnum>("date");
    const [showTime, setShowTime] = useState(false);
    const [presets, setPresets] = useState(true);
    const [changes, setChanges] = useState(0);
    const [lastArgs, setLastArgs] = useState("—");

    const onSingleChange = useMemo(
        () =>
            createChangeAction((startDate, endDate) => {
                setDate(startDate);
                setChanges((c) => c + 1);
                setLastArgs(`startDate = ${show(startDate)} · endDate = ${show(endDate)}`);
            }),
        [],
    );
    const onRangeChange = useMemo(
        () =>
            createChangeAction((startDate, endDate) => {
                setStart(startDate);
                setEnd(endDate);
                setChanges((c) => c + 1);
                setLastArgs(`startDate = ${show(startDate)} · endDate = ${show(endDate)}`);
            }),
        [],
    );

    const common = {
        class: "",
        prpPicker: picker,
        prpShowTime: showTime,
        prpFormat: "",
        prpShowPresets: presets,
        prpAllowClear: true,
        prpSize: "medium" as const,
        prpFullWidth: true,
    };

    return (
        <section>
            <h2>AxNewDatePicker</h2>
            <div className="app__controls">
                <label>
                    Picker{" "}
                    <select
                        value={picker}
                        onChange={(e) => setPicker(e.target.value as PrpPickerEnum)}
                    >
                        {PICKERS.map((p) => (
                            <option key={p}>{p}</option>
                        ))}
                    </select>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showTime}
                        onChange={(e) => setShowTime(e.target.checked)}
                    />{" "}
                    Show time
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={presets}
                        onChange={(e) => setPresets(e.target.checked)}
                    />{" "}
                    Presets
                </label>
                <button type="button" onClick={() => setDate(undefined)}>
                    Clear (external)
                </button>
                <span>
                    On change ran {changes}× — last: <code>{lastArgs}</code>
                </span>
            </div>

            <div className="app__grid">
                <div>
                    <h3>Single</h3>
                    <AxNewDatePicker
                        {...common}
                        name="ax-new-date-single"
                        prpMode="single"
                        prpStartDate={createDynamicValue<Date>(date as Date)}
                        prpPlaceholder={createDynamicValue(`Pick a ${picker}`)}
                        prpOnChange={onSingleChange}
                    />
                    <p className="app__hint">Value: {show(date)}</p>
                </div>
                <div>
                    <h3>Range</h3>
                    <AxNewDatePicker
                        {...common}
                        name="ax-new-date-range"
                        prpMode="range"
                        prpStartDate={createDynamicValue<Date>(start as Date)}
                        prpEndDate={createDynamicValue<Date>(end as Date)}
                        prpMinDate={createDynamicValue(new Date(2020, 0, 1))}
                        prpOnChange={onRangeChange}
                    />
                    <p className="app__hint">
                        Value: {show(start)} → {show(end)}
                    </p>
                </div>
            </div>
        </section>
    );
}
