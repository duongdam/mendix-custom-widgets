import { useState } from "react";
import Big from "big.js";
import type { DynamicValue } from "mendix";

import { IRISSteps } from "../../widgets/iris-steps/src/IRISSteps";
import type {
    PrpOrientationEnum,
    PrpStepsTypeEnum,
} from "../../widgets/iris-steps/typings/IRISStepsProps";
import { createActionValue, createDynamicValue, createEditableValue } from "./mocks/mendixMocks";
import { WIZARD_STEPS } from "./mocks/antdFixtures";

const TYPES: PrpStepsTypeEnum[] = ["default", "navigation", "dot", "inline", "panel"];

const STATIC_ITEMS = WIZARD_STEPS.map((step) => ({
    prpTitle: createDynamicValue(step.title) as DynamicValue<string>,
    prpDescription: createDynamicValue(step.description) as DynamicValue<string>,
}));

export function IRISStepsDemo() {
    const [current, setCurrent] = useState(1);
    const [type, setType] = useState<PrpStepsTypeEnum>("default");
    const [orientation, setOrientation] = useState<PrpOrientationEnum>("horizontal");
    const [clickable, setClickable] = useState(true);
    const [error, setError] = useState(false);
    const [changes, setChanges] = useState(0);

    return (
        <section>
            <h2>IRISSteps</h2>
            <div className="app__controls">
                <button disabled={current <= 0} onClick={() => setCurrent((c) => c - 1)}>
                    ← Previous
                </button>
                <button
                    disabled={current >= WIZARD_STEPS.length - 1}
                    onClick={() => setCurrent((c) => c + 1)}
                >
                    Next →
                </button>
                <label>
                    Type{" "}
                    <select value={type} onChange={(e) => setType(e.target.value as PrpStepsTypeEnum)}>
                        {TYPES.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Orientation{" "}
                    <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as PrpOrientationEnum)}
                    >
                        <option>horizontal</option>
                        <option>vertical</option>
                    </select>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={clickable}
                        onChange={(e) => setClickable(e.target.checked)}
                    />{" "}
                    Clickable
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={error}
                        onChange={(e) => setError(e.target.checked)}
                    />{" "}
                    Show error when
                </label>
                <span>
                    Current = <code>{current}</code> · On change ran {changes}×
                </span>
            </div>

            <IRISSteps
                name="iris-steps-demo"
                class=""
                prpCurrent={createEditableValue<Big>(new Big(current), (v) =>
                    setCurrent(v ? Number(v.toString()) : 0),
                )}
                prpItemsSource="static"
                prpStaticItems={STATIC_ITEMS}
                prpClickable={clickable}
                prpErrorWhen={createDynamicValue(error)}
                prpStepsType={type}
                prpOrientation={orientation}
                prpSize="medium"
                prpOnChange={createActionValue(() => setChanges((c) => c + 1))}
            />
        </section>
    );
}
