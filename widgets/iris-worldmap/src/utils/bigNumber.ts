import { Big } from "big.js";

export function bigToNumber(value: Big | undefined): number | undefined {
    return value === undefined ? undefined : value.toNumber();
}
