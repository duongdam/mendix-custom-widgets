import { ColumnDef, TableRow } from "../types/TableTypes";
import { normalizeColumns, RawColumnInput } from "./columnMapper";

export const ROW_KEY_FIELD = "RowKey";
export const HAS_INVALID_FIELD = "HasInvalid";

// A row flagged `HasInvalid: true` (or "true") is disabled: greyed out, not selectable, and
// skipped by select all.
export function isRowInvalid(row: TableRow): boolean {
    const flag = row.values[HAS_INVALID_FIELD];
    return flag === true || (typeof flag === "string" && flag.toLowerCase() === "true");
}

function parseJsonArray(value: string | undefined | null): unknown[] {
    if (!value) {
        return [];
    }
    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isTrue(value: unknown): boolean {
    return value === true || (typeof value === "string" && value.toLowerCase() === "true");
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

function asNumber(value: unknown): number | undefined {
    const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(num) ? num : undefined;
}

// A bare number (or numeric string) is treated as pixels; anything else ("20%", "8rem") passes through.
function toCssSize(value: unknown): string | undefined {
    if (typeof value === "number") {
        return `${value}px`;
    }
    if (typeof value === "string" && value.trim() !== "") {
        return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value.trim()}px` : value.trim();
    }
    return undefined;
}

function toBadgeColors(value: unknown): Record<string, string> | undefined {
    if (!isRecord(value)) {
        return undefined;
    }
    const result: Record<string, string> = {};
    for (const [key, color] of Object.entries(value)) {
        if (typeof color === "string") {
            result[key.trim().toLowerCase()] = color.trim();
        }
    }
    return result;
}

// '[{"header":"No","label":"No","width":50}, ...]' -> ColumnDef[]
// `header` is the field name in the data JSON; `label` falls back to it. Columns are sortable
// unless `sortable: false`, since sorting runs client-side in dynamic mode.
export function parseHeaderJson(value: string | undefined | null): ColumnDef[] {
    const raw: RawColumnInput[] = parseJsonArray(value)
        .filter(isRecord)
        .map(item => {
            const header = asString(item.header);
            return {
                key: header,
                label: asString(item.label) ?? header,
                order: asNumber(item.order),
                width: toCssSize(item.width),
                minWidth: toCssSize(item.minWidth),
                grow: asNumber(item.grow),
                sortable: typeof item.sortable === "boolean" ? item.sortable : true,
                // `hidden: true` hides the column; the older `visible` flag still works.
                visible: isTrue(item.hidden) ? false : typeof item.visible === "boolean" ? item.visible : undefined,
                align: asString(item.align),
                wrap: typeof item.wrap === "boolean" ? item.wrap : undefined,
                formatType: asString(item.formatType),
                formatPattern: asString(item.formatPattern),
                badgeColors: toBadgeColors(item.badgeColors)
            };
        });
    return normalizeColumns(raw);
}

// '[{"RowKey":"1","No":"1","Name":"test"}]' -> TableRow[]
// Rows without a RowKey fall back to their index so they stay selectable.
export function parseDataJson(value: string | undefined | null): TableRow[] {
    return parseJsonArray(value)
        .filter(isRecord)
        .map((item, index) => ({
            key: asString(item[ROW_KEY_FIELD]) ?? String(index),
            values: item
        }));
}
