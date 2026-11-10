import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ValueStatus } from "mendix";

import { AxNewSelecterContainerProps } from "../typings/AxNewSelecterProps";
import { OptionItem, AxNewSelecterMain } from "./components/AxNewSelecterMain";

import "./ui/AxNewSelecter.css";

function parseKeys(value: string | undefined): string[] {
    return value ? value.split(",").filter(Boolean) : [];
}

export function AxNewSelecter(props: AxNewSelecterContainerProps): ReactElement {
    const { prpItems, prpKeyAttribute, prpNameAttribute, prpSelectedItems, prpOnChange } = props;
    const isMultiple = props.prpMode === "multiple";

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    // Set when the widget itself triggered the change, so the echoed prpSelectedItems is not re-applied.
    const isInternalUpdateRef = useRef(false);

    // Options are rebuilt only when the datasource changes (not on selection / search).
    const options = useMemo<OptionItem[]>(() => {
        if (prpItems.status !== ValueStatus.Available || !prpItems.items) {
            return [];
        }
        return prpItems.items.map(item => {
            const value = String(prpKeyAttribute.get(item)?.value ?? "");
            return { value, label: prpNameAttribute.get(item)?.value ?? value };
        });
    }, [prpItems, prpKeyAttribute, prpNameAttribute]);

    // Sync from prpSelectedItems when it changes externally (also for an empty value).
    useEffect(() => {
        if (prpSelectedItems?.status !== ValueStatus.Available) {
            return;
        }
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            return;
        }
        const keys = parseKeys(prpSelectedItems.value);
        setSelectedKeys(isMultiple ? keys : keys.slice(0, 1));
    }, [prpSelectedItems, isMultiple]);

    // Drop selected keys that no longer exist in the list (e.g. after a data reload).
    useEffect(() => {
        if (prpItems.status !== ValueStatus.Available) {
            return;
        }
        const valid = new Set(options.map(o => o.value));
        setSelectedKeys(prev => {
            const next = prev.filter(k => valid.has(k));
            return next.length === prev.length ? prev : next;
        });
    }, [options, prpItems.status]);

    const handleChange = useCallback(
        (next: string[]) => {
            setSelectedKeys(next);
            isInternalUpdateRef.current = true;
            if (prpOnChange?.canExecute && !prpOnChange.isExecuting) {
                prpOnChange.execute({ selectedKeys: next.join(",") });
            }
        },
        [prpOnChange]
    );

    return (
        <AxNewSelecterMain
            className={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            options={options}
            multiple={isMultiple}
            value={selectedKeys}
            placeholder={
                (props.prpPlaceholder?.status === ValueStatus.Available ? props.prpPlaceholder.value : undefined) || undefined
            }
            showSearch={props.prpShowSearch}
            allowClear={props.prpAllowClear}
            disabled={false}
            loading={prpItems.status === ValueStatus.Loading}
            size={props.prpSize}
            onChange={handleChange}
        />
    );
}
