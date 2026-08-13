import { useState } from "react";

import { IRISPanel } from "../../widgets/iris-panel/src/IRISPanel";
import { createDynamicValue } from "./mocks/mendixMocks";
import { PANEL_TITLE_PRESETS } from "./mocks/panelFixtures";

export function IRISPanelDemo() {
    const [titleIndex, setTitleIndex] = useState(0);

    return (
        <section>
            <h2>IRISPanel</h2>
            <div className="app__controls">
                <label>
                    Title preset{" "}
                    <select
                        value={titleIndex}
                        onChange={(e) => setTitleIndex(Number(e.target.value))}
                    >
                        {PANEL_TITLE_PRESETS.map((preset, index) => (
                            <option key={preset} value={index}>
                                {preset}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <IRISPanel
                name="iris-panel-preview"
                class=""
                title={createDynamicValue<string>(
                    PANEL_TITLE_PRESETS[titleIndex] ?? PANEL_TITLE_PRESETS[0]!,
                )}
            />
        </section>
    );
}
