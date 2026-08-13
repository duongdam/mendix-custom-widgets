import type {
    ActionValue,
    DynamicValue,
    EditableValue,
    ListAttributeValue,
    ListValue,
    ObjectItem,
} from "mendix";

/**
 * Lightweight stand-ins for the Mendix Client API, for rendering pluggable widgets
 * outside of Studio Pro. They cover the fields real widgets read/call in practice —
 * not the full Client API surface (e.g. formatting, sorting, filtering are unmocked).
 */

export function createDynamicValue<T>(value: T): DynamicValue<T> {
    return { status: "available", value } as DynamicValue<T>;
}

export function createEditableValue<T extends string | boolean | Date>(
    value: T,
    onChange?: (value: T) => void,
): EditableValue<T> {
    return {
        status: "available",
        value,
        readOnly: false,
        validation: undefined,
        setValue: (next: T | undefined) => {
            if (next !== undefined) {
                onChange?.(next);
            }
        },
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

export function createListAttributeValue<T extends string | boolean | Date>(
    id: string,
    getValue: (item: ObjectItem) => T,
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
