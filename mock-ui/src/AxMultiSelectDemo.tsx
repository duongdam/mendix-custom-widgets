import { useCallback, useMemo, useState } from "react";
import type { ActionValue, ListAttributeValue, Option } from "mendix";
import type { Big } from "big.js";

import { AxMultiSelect } from "../../widgets/iris-multiselection/src/AxMultiSelect";
import { createDynamicValue, createListAttributeValue, createListValue } from "./mocks/mendixMocks";
import {
    DEFAULT_SELECTED_KEYS,
    MOCK_ITEM_RECORDS,
    MockItemRecord,
} from "./mocks/multiSelectFixtures";

function toBig(value: number): Big {
    return { toString: () => String(value), valueOf: () => String(value) } as unknown as Big;
}

export function AxMultiSelectDemo() {
    const [type, setType] = useState<"multi" | "single" | "onlyView">("multi");
    const [itemCount, setItemCount] = useState(200);
    const [lastChange, setLastChange] = useState(DEFAULT_SELECTED_KEYS || "—");
    const [changeCount, setChangeCount] = useState(0);
    // Simulates prpSelectedItems being (re)set from outside the widget, e.g. by a microflow.
    const [externalSelectedItems, setExternalSelectedItems] = useState(DEFAULT_SELECTED_KEYS);

    const handleChange = useCallback((selectedKeys: string) => {
        setLastChange(selectedKeys || "(empty)");
        setChangeCount((count) => count + 1);
    }, []);

    const records = useMemo(() => MOCK_ITEM_RECORDS.slice(0, itemCount), [itemCount]);

    const keyAttribute = useMemo(
        () =>
            createListAttributeValue("mock.Key", (item) =>
                String((item as unknown as MockItemRecord).key),
            ) as unknown as ListAttributeValue<Big | string>,
        [],
    );
    const nameAttribute = useMemo(
        () =>
            createListAttributeValue(
                "mock.Name",
                (item) => (item as unknown as MockItemRecord).name,
            ),
        [],
    );

    const onChange: ActionValue<{ selectedKeys: Option<string> }> = useMemo(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: ({ selectedKeys }: { selectedKeys: Option<string> }) =>
                    handleChange(selectedKeys ?? ""),
            }) as unknown as ActionValue<{ selectedKeys: Option<string> }>,
        [handleChange],
    );

    return (
        <section>
            <h2>AxMultiSelect</h2>
            <div className="app__controls">
                <label>
                    Type{" "}
                    <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                        <option value="multi">Multi</option>
                        <option value="single">Single</option>
                        <option value="onlyView">Only View</option>
                    </select>
                </label>
                <label>
                    Item count{" "}
                    <select
                        value={itemCount}
                        onChange={(e) => setItemCount(Number(e.target.value))}
                    >
                        <option value={100}>100</option>
                        <option value={1000}>1,000</option>
                        <option value={5000}>5,000</option>
                    </select>
                </label>
                <button type="button" onClick={() => setExternalSelectedItems("")}>
                    Clear selection (external)
                </button>
                <button
                    type="button"
                    onClick={() => setExternalSelectedItems(DEFAULT_SELECTED_KEYS)}
                >
                    Reset selection (external)
                </button>
            </div>

            <AxMultiSelect
                name="ax-multiselect-preview"
                class=""
                prpHeight={createDynamicValue(toBig(240))}
                prpItemHeight={createDynamicValue(toBig(32))}
                prpPlaceholder={createDynamicValue("Search...")}
                prpShowSearch={createDynamicValue(true)}
                prpTextSearch={createDynamicValue("")}
                type={type}
                prpSelectedItems={createDynamicValue(externalSelectedItems)}
                items={createListValue(records)}
                keyAttribute={keyAttribute}
                nameAttribute={nameAttribute}
                onChange={onChange}
            />
            <p>
                Last change: <code>{lastChange}</code> ({changeCount} time(s))
            </p>
        </section>
    );
}
