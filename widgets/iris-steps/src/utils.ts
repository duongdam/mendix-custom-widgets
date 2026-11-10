import type { Big } from "big.js";
import type { ActionValue } from "mendix";

/** Converts a Mendix Decimal (Big) to a JS number; `undefined` stays `undefined`. */
export function bigToNumber(value: Big | undefined): number | undefined {
    return value === undefined ? undefined : Number(value.toString());
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


/** The value when available, otherwise `undefined`. */
export function valueOrUndefined<T>(value: { status: string; value?: T } | undefined): T | undefined {
    return value?.status === "available" ? value.value : undefined;
}
