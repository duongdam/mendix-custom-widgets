import type { ActionValue, EditableValue } from "mendix";

/** Structural subset of any `EditableValue<T>`, whatever its attribute type. */
export interface EditableLike {
    status: "available" | "loading" | "unavailable";
    readOnly: boolean;
    validation?: string;
}

export interface OptionItem {
    value: string;
    label: string;
}

/** True when the user may change the value (available and not read-only). */
export function isEditable(value: EditableLike | undefined): boolean {
    return value?.status === "available" && !value.readOnly;
}

/** The current validation message of an editable value, if any. */
export function validationOf(value: EditableLike | undefined): string | undefined {
    return value?.validation || undefined;
}

/**
 * Options for an Enumeration (or Boolean) attribute, taken from its universe and captioned
 * with the attribute's own formatter — so captions follow the app's language and enum captions.
 */
export function enumOptions<T extends string | boolean>(
    value: EditableValue<T> | undefined,
): OptionItem[] {
    if (!value?.universe) {
        return [];
    }
    const formatter = value.formatter as { format: (v?: T) => string };
    return value.universe.map((item) => ({ value: String(item), label: formatter.format(item) }));
}

/** Executes a Mendix action if it is set and currently allowed to run. */
export function executeAction(action: ActionValue | undefined): void {
    if (action?.canExecute && !action.isExecuting) {
        action.execute();
    }
}
