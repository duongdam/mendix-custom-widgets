import { useCallback, useMemo, useState } from "react";
import type { ActionValue, ListAttributeValue, Option } from "mendix";
import type { Big } from "big.js";

import { AxNewSelecter } from "../../widgets/iris-select/src/AxNewSelecter";
import { createDynamicValue, createListAttributeValue, createListValue } from "./mocks/mendixMocks";
import { DEFAULT_SELECTED_KEYS, MOCK_ITEM_RECORDS, MockItemRecord } from "./mocks/multiSelectFixtures";

const PREVIEW_KEY_COUNT = 20;

function summarizeKeys(keys: string): string {
    if (!keys.includes(",")) {
        return keys;
    }
    const all = keys.split(",");
    const shown = all.slice(0, PREVIEW_KEY_COUNT).join(", ");
    const rest = all.length - PREVIEW_KEY_COUNT;
    return `${all.length} selected: ${shown}${rest > 0 ? ` … (+${rest} more)` : ""}`;
}

// Big dataset for the 10,000-item case (MOCK_ITEM_RECORDS has 5,000).
const BIG_RECORDS: MockItemRecord[] = Array.from({ length: 10000 }, (_, i) => ({
    key: i + 1,
    name: `Item ${String(i + 1).padStart(5, "0")} — ${["Alpha", "Beta", "Gamma", "Delta"][i % 4]}`,
}));

export function AxNewSelecterDemo() {
    const [mode, setMode] = useState<"single" | "multiple">("multiple");
    const [itemCount, setItemCount] = useState(1000);
    const [lastChange, setLastChange] = useState(DEFAULT_SELECTED_KEYS || "—");
    const [changeCount, setChangeCount] = useState(0);
    const [externalSelectedItems, setExternalSelectedItems] = useState(DEFAULT_SELECTED_KEYS);

    const handleChange = useCallback((selectedKeys: string) => {
        setLastChange(selectedKeys || "(empty)");
        setChangeCount(c => c + 1);
    }, []);

    const records = useMemo(() => BIG_RECORDS.slice(0, itemCount), [itemCount]);
    const listValue = useMemo(() => createListValue(records), [records]);

    const keyAttribute = useMemo(
        () =>
            createListAttributeValue("mock.Key", item =>
                String((item as unknown as MockItemRecord).key)
            ) as unknown as ListAttributeValue<Big | string>,
        []
    );
    const nameAttribute = useMemo(
        () => createListAttributeValue("mock.Name", item => (item as unknown as MockItemRecord).name),
        []
    );
    const onChange = useMemo(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: ({ selectedKeys }: { selectedKeys: Option<string> }) => handleChange(selectedKeys ?? "")
            }) as unknown as ActionValue<{ selectedKeys: Option<string> }>,
        [handleChange]
    );
    const selectedItems = useMemo(() => createDynamicValue(externalSelectedItems), [externalSelectedItems]);
    const placeholder = useMemo(() => createDynamicValue("Select..."), []);

    return (
        <section>
            <h2>AxNewSelecter</h2>
            <div className="app__controls">
                <label>
                    Mode{" "}
                    <select
                        value={mode}
                        onChange={e => {
                            setMode(e.target.value as typeof mode);
                            setExternalSelectedItems("");
                        }}
                    >
                        <option value="single">Single</option>
                        <option value="multiple">Multiple</option>
                    </select>
                </label>
                <label>
                    Item count{" "}
                    <select value={itemCount} onChange={e => setItemCount(Number(e.target.value))}>
                        <option value={100}>100</option>
                        <option value={1000}>1,000</option>
                        <option value={10000}>10,000</option>
                    </select>
                </label>
                <button type="button" onClick={() => setExternalSelectedItems("")}>
                    Clear selection (external)
                </button>
                <button type="button" onClick={() => setExternalSelectedItems(DEFAULT_SELECTED_KEYS)}>
                    Reset selection (external)
                </button>
            </div>

            <AxNewSelecter
                name="ax-new-selecter-preview"
                class=""
                prpMode={mode}
                prpSelectedItems={selectedItems}
                prpItems={listValue}
                prpKeyAttribute={keyAttribute}
                prpNameAttribute={nameAttribute}
                prpPlaceholder={placeholder}
                prpShowSearch
                prpAllowClear
                prpSize="medium"
                prpOnChange={onChange}
            />
            <p>
                Last change: <code>{summarizeKeys(lastChange)}</code> ({changeCount} time(s))
            </p>
        </section>
    );
}
