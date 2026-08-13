import { useState } from "react";

import { IRISButton } from "../../widgets/iris-button/src/IRISButton";
import { createActionValue, createDynamicValue } from "./mocks/mendixMocks";
import { BUTTON_PRESETS } from "./mocks/buttonFixtures";

export function IRISButtonDemo() {
    const [presetIndex, setPresetIndex] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    // BUTTON_PRESETS is a non-empty constant; presetIndex only ever comes from its own <option>s.
    const preset = (BUTTON_PRESETS[presetIndex] ?? BUTTON_PRESETS[0])!;

    return (
        <section>
            <h2>IRISButton</h2>
            <div className="app__controls">
                <label>
                    Preset{" "}
                    <select
                        value={presetIndex}
                        onChange={(e) => setPresetIndex(Number(e.target.value))}
                    >
                        {BUTTON_PRESETS.map((p, index) => (
                            <option key={p.caption} value={index}>
                                {p.caption} ({p.variant})
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <IRISButton
                name="iris-button-preview"
                class=""
                caption={createDynamicValue(preset.caption)}
                variant={preset.variant}
                onClick={createActionValue(() => setClickCount((count) => count + 1))}
            />
            <p>Clicked {clickCount} time(s)</p>
        </section>
    );
}
