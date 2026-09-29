import type {
    ActionValue,
    DynamicValue,
    EditableValue,
    ListAttributeValue,
    ListValue,
    ObjectItem,
} from "mendix";
import type { Big } from "big.js";

/**
 * Lightweight stand-ins for the Mendix Client API, for rendering pluggable widgets
 * outside of Studio Pro. They cover the fields real widgets read/call in practice —
 * not the full Client API surface (e.g. formatting, sorting, filtering are unmocked).
 */

export function createDynamicValue<T>(value: T): DynamicValue<T> {
    return { status: "available", value } as DynamicValue<T>;
}

export interface EditableValueMockOptions<T> {
    /** Possible values — set for Enumeration / Boolean attributes. */
    universe?: T[];
    /** Caption per value, used by `formatter.format` (e.g. enum captions). */
    format?: (value: T | undefined) => string;
    readOnly?: boolean;
    validation?: string;
}

export function createEditableValue<T extends string | boolean | Date | Big>(
    value: T | undefined,
    onChange?: (value: T | undefined) => void,
    options: EditableValueMockOptions<T> = {},
): EditableValue<T> {
    const format = options.format ?? ((v: T | undefined) => (v === undefined ? "" : String(v)));
    return {
        status: "available",
        value,
        displayValue: format(value),
        universe: options.universe,
        formatter: { format },
        readOnly: options.readOnly ?? false,
        validation: options.validation,
        // Real Mendix EditableValue.setValue(undefined) clears the attribute — unlike the rest
        // of this file's DynamicValue helpers, this must forward `undefined` too, not swallow it.
        setValue: (next: T | undefined) => onChange?.(next),
        setValidator: () => {},
    } as unknown as EditableValue<T>;
}

export function createActionValue(fn: () => void): ActionValue {
    return {
        canExecute: true,
        isExecuting: false,
        execute: fn,
    } as unknown as ActionValue;
}

export function createListAttributeValue<T extends string | boolean | Date | Big>(
    id: string,
    getValue: (item: ObjectItem) => T | undefined,
): ListAttributeValue<T> {
    return {
        id: id as unknown as ListAttributeValue<T>["id"],
        sortable: true,
        filterable: true,
        type: "String",
        formatter: {},
        universe: undefined,
        isList: false,
        get: (item: ObjectItem) =>
            ({
                status: "available",
                value: getValue(item),
                readOnly: true,
                validation: undefined,
                setValue: () => {},
                setValidator: () => {},
            }) as unknown as EditableValue<T>,
    } as unknown as ListAttributeValue<T>;
}

export function createListValue<T extends object>(items: T[]): ListValue {
    const objectItems: ObjectItem[] = items.map(
        (item, index) => ({ ...item, id: `mock-item-${index}` }) as unknown as ObjectItem,
    );

    return {
        status: "available",
        offset: 0,
        limit: Number.POSITIVE_INFINITY,
        sortOrder: [],
        filter: undefined,
        items: objectItems,
        hasMoreItems: false,
        totalCount: objectItems.length,
        setOffset: () => {},
        setLimit: () => {},
        requestTotalCount: () => {},
        setSortOrder: () => {},
        setFilter: () => {},
        reload: () => {},
    } as unknown as ListValue;
}
