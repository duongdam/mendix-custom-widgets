import { useState } from "react";
import type { ObjectItem } from "mendix";

import { IRISSelect } from "../../widgets/iris-select/src/IRISSelect";
import {
    createActionValue,
    createDynamicValue,
    createEditableValue,
    createListAttributeValue,
    createListValue,
} from "./mocks/mendixMocks";
import {
    COUNTRIES,
    PRIORITY_CAPTIONS,
    PRIORITY_KEYS,
    createListExpressionValue,
} from "./mocks/antdFixtures";

type CountryItem = ObjectItem & { code: string; name: string };

export function IRISSelectDemo() {
    const [priority, setPriority] = useState<string | undefined>("medium");
    const [country, setCountry] = useState<string | undefined>();
    const [readOnly, setReadOnly] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [changes, setChanges] = useState(0);
    const onChangeAction = createActionValue(() => setChanges((c) => c + 1));

    return (
        <section>
            <h2>IRISSelect</h2>
            <div className="app__controls">
                <label>
                    <input
                        type="checkbox"
                        checked={readOnly}
                        onChange={(e) => setReadOnly(e.target.checked)}
                    />{" "}
                    Read-only
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={invalid}
                        onChange={(e) => setInvalid(e.target.checked)}
                    />{" "}
                    Validation error
                </label>
                <span>
                    Priority = <code>{String(priority)}</code> · Country ={" "}
                    <code>{String(country)}</code> · On change ran {changes}×
                </span>
            </div>

            <div className="app__grid">
                <div>
                    <h3>Enumeration attribute</h3>
                    <IRISSelect
                        name="iris-select-enum"
                        class=""
                        attribute={createEditableValue<string>(priority, setPriority, {
                            universe: PRIORITY_KEYS,
                            format: (v) => (v ? (PRIORITY_CAPTIONS[v] ?? v) : ""),
                            readOnly,
                            validation: invalid ? "Priority is required." : undefined,
                        })}
                        optionsSource="attribute"
                        placeholder={createDynamicValue("Choose a priority")}
                        showSearch={false}
                        allowClear
                        size="medium"
                        variant="outlined"
                        onChangeAction={onChangeAction}
                    />
                </div>
                <div>
                    <h3>Data source (searchable)</h3>
                    <IRISSelect
                        name="iris-select-ds"
                        class=""
                        attribute={createEditableValue<string>(country, setCountry, { readOnly })}
                        optionsSource="datasource"
                        optionsDatasource={createListValue(COUNTRIES)}
                        optionValue={createListAttributeValue<string>(
                            "code",
                            (item) => (item as CountryItem).code,
                        )}
                        optionLabel={createListExpressionValue(
                            (item) =>
                                `${(item as CountryItem).name} (${(item as CountryItem).code})`,
                        )}
                        placeholder={createDynamicValue("Search a country")}
                        showSearch
                        allowClear
                        size="medium"
                        variant="filled"
                        onChangeAction={onChangeAction}
                    />
                </div>
            </div>
        </section>
    );
}
