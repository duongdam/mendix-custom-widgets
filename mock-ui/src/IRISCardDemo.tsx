import { useMemo, useState } from "react";

import { IRISCard } from "../../widgets/iris-card/src/IRISCard";
import { createEditableValue, createListValue } from "./mocks/mendixMocks";
import { CARD_TITLE_PRESETS, MOCK_CARD_ITEMS } from "./mocks/cardFixtures";

export function IRISCardDemo() {
    const [title, setTitle] = useState<string>(CARD_TITLE_PRESETS[0] ?? "My IRIS Card");
    const [itemCount, setItemCount] = useState(3);

    const items = useMemo(() => MOCK_CARD_ITEMS.slice(0, itemCount), [itemCount]);

    return (
        <section>
            <h2>IRISCard</h2>
            <div className="app__controls">
                <label>
                    Title preset{" "}
                    <select value={title} onChange={(e) => setTitle(e.target.value)}>
                        {CARD_TITLE_PRESETS.map((preset) => (
                            <option key={preset} value={preset}>
                                {preset}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Item count{" "}
                    <select
                        value={itemCount}
                        onChange={(e) => setItemCount(Number(e.target.value))}
                    >
                        <option value={0}>0</option>
                        <option value={3}>3</option>
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                    </select>
                </label>
            </div>

            <IRISCard
                name="iris-card-preview"
                class=""
                title={createEditableValue(title, next => setTitle(next ?? ""))}
                items={createListValue(items)}
            />
        </section>
    );
}
