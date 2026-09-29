import { useState } from "react";
import Big from "big.js";
import type { DynamicValue } from "mendix";

import { IRISSteps } from "../../widgets/iris-steps/src/IRISSteps";
import type {
    OrientationEnum,
    StepsTypeEnum,
} from "../../widgets/iris-steps/typings/IRISStepsProps";
import { createActionValue, createDynamicValue, createEditableValue } from "./mocks/mendixMocks";
import { WIZARD_STEPS } from "./mocks/antdFixtures";

const TYPES: StepsTypeEnum[] = ["default", "navigation", "dot", "inline", "panel"];

const STATIC_ITEMS = WIZARD_STEPS.map((step) => ({
    title: createDynamicValue(step.title) as DynamicValue<string>,
    description: createDynamicValue(step.description) as DynamicValue<string>,
}));

export function IRISStepsDemo() {
    const [current, setCurrent] = useState(1);
    const [type, setType] = useState<StepsTypeEnum>("default");
    const [orientation, setOrientation] = useState<OrientationEnum>("horizontal");
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
                    <select value={type} onChange={(e) => setType(e.target.value as StepsTypeEnum)}>
                        {TYPES.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Orientation{" "}
                    <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as OrientationEnum)}
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
                current={createEditableValue<Big>(new Big(current), (v) =>
                    setCurrent(v ? Number(v.toString()) : 0),
                )}
                itemsSource="static"
                staticItems={STATIC_ITEMS}
                clickable={clickable}
                status="process"
                errorWhen={createDynamicValue(error)}
                stepsType={type}
                orientation={orientation}
                titlePlacement="horizontal"
                size="medium"
                onChangeAction={createActionValue(() => setChanges((c) => c + 1))}
            />
        </section>
    );
}
