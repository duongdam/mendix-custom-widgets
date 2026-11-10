import { useState } from "react";
import type { DynamicValue } from "mendix";

import { IRISSegmented } from "../../widgets/iris-segmented/src/IRISSegmented";
import { createActionValue, createDynamicValue, createEditableValue } from "./mocks/mendixMocks";
import { PRIORITY_CAPTIONS, PRIORITY_KEYS } from "./mocks/antdFixtures";

const VIEW_OPTIONS = [
    { prpValue: "day", prpCaption: createDynamicValue("Day") as DynamicValue<string> },
    { prpValue: "week", prpCaption: createDynamicValue("Week") as DynamicValue<string> },
    { prpValue: "month", prpCaption: createDynamicValue("Month") as DynamicValue<string> },
    { prpValue: "year", prpCaption: createDynamicValue("Year") as DynamicValue<string> },
];

export function IRISSegmentedDemo() {
    const [priority, setPriority] = useState<string | undefined>();
    const [view, setView] = useState<string | undefined>("week");
    const [block, setBlock] = useState(false);
    const [changes, setChanges] = useState(0);
    const onChangeAction = createActionValue(() => setChanges((c) => c + 1));

    return (
        <section>
            <h2>IRISSegmented</h2>
            <div className="app__controls">
                <label>
                    <input
                        type="checkbox"
                        checked={block}
                        onChange={(e) => setBlock(e.target.checked)}
                    />{" "}
                    Full width
                </label>
                <span>
                    Priority = <code>{String(priority)}</code> · View = <code>{String(view)}</code>{" "}
                    · On change ran {changes}×
                </span>
            </div>

            <h3>Enumeration attribute (starts empty)</h3>
            <IRISSegmented
                name="iris-segmented-enum"
                class=""
                prpAttribute={createEditableValue<string>(priority, setPriority, {
                    universe: PRIORITY_KEYS,
                    format: (v) => (v ? (PRIORITY_CAPTIONS[v] ?? v) : ""),
                })}
                prpOptionsSource="attribute"
                prpStaticOptions={[]}
                prpSize="medium"
                prpBlock={block}
                prpVertical={false}
                prpOnChange={onChangeAction}
            />

            <h3>Static options</h3>
            <IRISSegmented
                name="iris-segmented-static"
                class=""
                prpAttribute={createEditableValue<string>(view, setView)}
                prpOptionsSource="static"
                prpStaticOptions={VIEW_OPTIONS}
                prpSize="large"
                prpBlock={block}
                prpVertical={false}
                prpOnChange={onChangeAction}
            />
        </section>
    );
}
