import type { Big } from "big.js";

/** Converts a Mendix Decimal (Big) to a JS number; `undefined` stays `undefined`. */
export function bigToNumber(value: Big | undefined): number | undefined {
    return value === undefined ? undefined : Number(value.toString());
}


/** Clamps `value` into `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}


/** The value when available, otherwise `undefined`. */
export function valueOrUndefined<T>(value: { status: string; value?: T } | undefined): T | undefined {
    return value?.status === "available" ? value.value : undefined;
}
