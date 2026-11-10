import { useState } from "react";
import Big from "big.js";

import { IRISProgress } from "../../widgets/iris-progress/src/IRISProgress";
import type {
    PrpProgressTypeEnum,
    PrpStatusEnum,
} from "../../widgets/iris-progress/typings/IRISProgressProps";
import { createActionValue, createDynamicValue } from "./mocks/mendixMocks";

const TYPES: PrpProgressTypeEnum[] = ["line", "circle", "dashboard"];
const STATUSES: PrpStatusEnum[] = ["auto", "normal", "active", "success", "exception"];

export function IRISProgressDemo() {
    const [value, setValue] = useState(7);
    const [max, setMax] = useState(10);
    const [type, setType] = useState<PrpProgressTypeEnum>("line");
    const [status, setStatus] = useState<PrpStatusEnum>("auto");
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
                        onChange={(e) => setType(e.target.value as PrpProgressTypeEnum)}
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
                        onChange={(e) => setStatus(e.target.value as PrpStatusEnum)}
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
                prpValue={createDynamicValue(new Big(value))}
                prpMaxValue={createDynamicValue(new Big(max))}
                prpSuccessValue={withSuccess ? createDynamicValue(new Big(value / 2)) : undefined}
                prpProgressType={type}
                prpShowInfo
                prpLabel={withLabel ? createDynamicValue(`${value} / ${max} tasks`) : undefined}
                prpStatus={status}
                prpExceptionWhen={createDynamicValue(exception)}
                prpLineSize="medium"
                prpCircleSize={120}
                prpSteps={steps}
                prpOnClick={createActionValue(() => setClicks((c) => c + 1))}
            />
        </section>
    );
}
