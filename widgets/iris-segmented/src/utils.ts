import type { ActionValue, EditableValue } from "mendix";

export interface OptionItem {
    value: string;
    label: string;
}


/** Options for an Enumeration (or Boolean) attribute, captioned with the attribute's own formatter. */
export function enumOptions<T extends string | boolean>(value: EditableValue<T> | undefined): OptionItem[] {
    if (!value?.universe) {
        return [];
    }
    const formatter = value.formatter as { format: (v?: T) => string };
    return value.universe.map(item => ({ value: String(item), label: formatter.format(item) }));
}


/** Executes a Mendix action if it is set and currently allowed to run. */
export function executeAction(action: ActionValue | undefined): void {
    if (action?.canExecute && !action.isExecuting) {
        action.execute();
    }
}


/** True when the user may change the value (available and not read-only). */
export function isEditable(value: { status: string; readOnly: boolean } | undefined): boolean {
    return value?.status === "available" && !value.readOnly;
}


/** The current validation message of an editable value, if any. */
export function validationOf(value: { validation?: string } | undefined): string | undefined {
    return value?.validation || undefined;
}
