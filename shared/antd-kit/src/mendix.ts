import type { Big } from "big.js";

/** Structural subset of Mendix `DynamicValue<T>` / `EditableValue<T>` the helpers need. */
export interface MendixValueLike<T> {
    status: "available" | "loading" | "unavailable";
    value?: T;
}

/** The value when the Mendix value is available, otherwise `fallback`. */
export function valueOr<T>(value: MendixValueLike<T> | undefined, fallback: T): T {
    return value?.status === "available" && value.value !== undefined ? value.value : fallback;
}

/** The value when available, otherwise `undefined`. */
export function valueOrUndefined<T>(value: MendixValueLike<T> | undefined): T | undefined {
    return value?.status === "available" ? value.value : undefined;
}

/** True while any of the given Mendix values is still loading. */
export function isLoading(...values: Array<{ status: string } | undefined>): boolean {
    return values.some((value) => value?.status === "loading");
}

/** Converts a Mendix Decimal (Big) to a JS number; `undefined` stays `undefined`. */
export function bigToNumber(value: Big | undefined): number | undefined {
    return value === undefined ? undefined : Number(value.toString());
}

/** Clamps `value` into `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
