import { useState } from "react";

import { IRISDatePicker } from "../../widgets/iris-datepicker/src/IRISDatePicker";
import type { PickerEnum } from "../../widgets/iris-datepicker/typings/IRISDatePickerProps";
import { createActionValue, createDynamicValue, createEditableValue } from "./mocks/mendixMocks";

const PICKERS: PickerEnum[] = ["date", "week", "month", "quarter", "year"];

function show(date: Date | undefined): string {
    return date ? date.toLocaleString() : "empty";
}

export function IRISDatePickerDemo() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [start, setStart] = useState<Date | undefined>();
    const [end, setEnd] = useState<Date | undefined>();
    const [picker, setPicker] = useState<PickerEnum>("date");
    const [showTime, setShowTime] = useState(false);
    const [presets, setPresets] = useState(true);
    const [changes, setChanges] = useState(0);
    const onChangeAction = createActionValue(() => setChanges((c) => c + 1));

    const common = {
        class: "",
        picker,
        showTime,
        format: "",
        showPresets: presets,
        allowClear: true,
        size: "medium" as const,
        variant: "outlined" as const,
        fullWidth: true,
        onChangeAction,
    };

    return (
        <section>
            <h2>IRISDatePicker</h2>
            <div className="app__controls">
                <label>
                    Picker{" "}
                    <select
                        value={picker}
                        onChange={(e) => setPicker(e.target.value as PickerEnum)}
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
                <span>On change ran {changes}×</span>
            </div>

            <div className="app__grid">
                <div>
                    <h3>Single</h3>
                    <IRISDatePicker
                        {...common}
                        name="iris-date-single"
                        startAttribute={createEditableValue<Date>(date, setDate)}
                        placeholder={createDynamicValue("Pick a date")}
                    />
                    <p className="app__hint">Stored: {show(date)}</p>
                </div>
                <div>
                    <h3>Range (End attribute set)</h3>
                    <IRISDatePicker
                        {...common}
                        name="iris-date-range"
                        startAttribute={createEditableValue<Date>(start, setStart)}
                        endAttribute={createEditableValue<Date>(end, setEnd)}
                        minDate={createDynamicValue(new Date(2020, 0, 1))}
                    />
                    <p className="app__hint">
                        Stored: {show(start)} → {show(end)}
                    </p>
                </div>
            </div>
        </section>
    );
}
