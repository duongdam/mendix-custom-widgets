import { useState } from "react";
import Big from "big.js";

import { IRISProgress } from "../../widgets/iris-progress/src/IRISProgress";
import type {
    ProgressTypeEnum,
    StatusEnum,
} from "../../widgets/iris-progress/typings/IRISProgressProps";
import { createActionValue, createDynamicValue } from "./mocks/mendixMocks";

const TYPES: ProgressTypeEnum[] = ["line", "circle", "dashboard"];
const STATUSES: StatusEnum[] = ["auto", "normal", "active", "success", "exception"];

export function IRISProgressDemo() {
    const [value, setValue] = useState(7);
    const [max, setMax] = useState(10);
    const [type, setType] = useState<ProgressTypeEnum>("line");
    const [status, setStatus] = useState<StatusEnum>("auto");
    const [exception, setException] = useState(false);
    const [steps, setSteps] = useState(0);
    const [withSuccess, setWithSuccess] = useState(false);
    const [withLabel, setWithLabel] = useState(false);
    const [clicks, setClicks] = useState(0);

    return (
        <section>
            <h2>IRISProgress</h2>
            <div className="app__controls">
                <label>
                    Value {value} / {max}{" "}
                    <input
                        type="range"
                        min={0}
                        max={max}
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                    />
                </label>
                <label>
                    Max{" "}
                    <input
                        type="number"
                        min={1}
                        value={max}
                        style={{ width: 60 }}
                        onChange={(e) => setMax(Math.max(1, Number(e.target.value)))}
                    />
                </label>
                <label>
                    Type{" "}
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as ProgressTypeEnum)}
                    >
                        {TYPES.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Status{" "}
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as StatusEnum)}
                    >
                        {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Steps{" "}
                    <input
                        type="number"
                        min={0}
                        value={steps}
                        style={{ width: 50 }}
                        onChange={(e) => setSteps(Math.max(0, Number(e.target.value)))}
                    />
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={exception}
                        onChange={(e) => setException(e.target.checked)}
                    />{" "}
                    Exception when
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={withSuccess}
                        onChange={(e) => setWithSuccess(e.target.checked)}
                    />{" "}
                    Success segment (half of value)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={withLabel}
                        onChange={(e) => setWithLabel(e.target.checked)}
                    />{" "}
                    Custom label
                </label>
                <span>Clicks: {clicks}</span>
            </div>

            <IRISProgress
                name="iris-progress-preview"
                class=""
                value={createDynamicValue(new Big(value))}
                maxValue={createDynamicValue(new Big(max))}
                successValue={withSuccess ? createDynamicValue(new Big(value / 2)) : undefined}
                progressType={type}
                showInfo
                label={withLabel ? createDynamicValue(`${value} / ${max} tasks`) : undefined}
                status={status}
                exceptionWhen={createDynamicValue(exception)}
                lineSize="medium"
                circleSize={120}
                steps={steps}
                strokeLinecap="round"
                onClick={createActionValue(() => setClicks((c) => c + 1))}
            />
        </section>
    );
}
