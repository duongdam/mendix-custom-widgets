import { useState } from "react";
import type { DynamicValue } from "mendix";

import { IRISSegmented } from "../../widgets/iris-segmented/src/IRISSegmented";
import { createActionValue, createDynamicValue, createEditableValue } from "./mocks/mendixMocks";
import { PRIORITY_CAPTIONS, PRIORITY_KEYS } from "./mocks/antdFixtures";

const VIEW_OPTIONS = [
    { value: "day", caption: createDynamicValue("Day") as DynamicValue<string> },
    { value: "week", caption: createDynamicValue("Week") as DynamicValue<string> },
    { value: "month", caption: createDynamicValue("Month") as DynamicValue<string> },
    { value: "year", caption: createDynamicValue("Year") as DynamicValue<string> },
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
                attribute={createEditableValue<string>(priority, setPriority, {
                    universe: PRIORITY_KEYS,
                    format: (v) => (v ? (PRIORITY_CAPTIONS[v] ?? v) : ""),
                })}
                optionsSource="attribute"
                staticOptions={[]}
                size="medium"
                block={block}
                vertical={false}
                onChangeAction={onChangeAction}
            />

            <h3>Static options</h3>
            <IRISSegmented
                name="iris-segmented-static"
                class=""
                attribute={createEditableValue<string>(view, setView)}
                optionsSource="static"
                staticOptions={VIEW_OPTIONS}
                size="large"
                block={block}
                vertical={false}
                onChangeAction={onChangeAction}
            />
        </section>
    );
}
