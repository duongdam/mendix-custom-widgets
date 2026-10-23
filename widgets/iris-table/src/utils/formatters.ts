import { ColumnFormatType } from "../types/tableTypes";

export type Formatter = (value: unknown, pattern?: string) => string;

function formatText(value: unknown): string {
    return value == null ? "" : String(value);
}

// Creating an Intl.NumberFormat is expensive (~20µs), and a big table formats hundreds of
// thousands of cells (render, search), so one instance per pattern is reused.
const numberFormats = new Map<string, Intl.NumberFormat>();

function numberFormat(key: string, create: () => Intl.NumberFormat): Intl.NumberFormat {
    let format = numberFormats.get(key);
    if (!format) {
        format = create();
        numberFormats.set(key, format);
    }
    return format;
}

function formatNumber(value: unknown, pattern?: string): string {
    const num = Number(value);
    if (Number.isNaN(num)) {
        return "";
    }
    const digits = pattern ? Number(pattern) : undefined;
    const fixed = digits !== undefined && !Number.isNaN(digits);
    return numberFormat(`n:${fixed ? digits : ""}`, () =>
        fixed
            ? new Intl.NumberFormat(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
            : new Intl.NumberFormat(undefined)
    ).format(num);
}

function formatCurrency(value: unknown, pattern?: string): string {
    const num = Number(value);
    if (Number.isNaN(num)) {
        return "";
    }
    const currency = pattern || "USD";
    return numberFormat(
        `c:${currency}`,
        () => new Intl.NumberFormat(undefined, { style: "currency", currency })
    ).format(num);
}

function formatDate(value: unknown, pattern?: string): string {
    if (value == null || value === "") {
        return "";
    }
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    if (pattern === "iso") {
        return date.toISOString();
    }
    if (pattern === "time") {
        return date.toLocaleTimeString();
    }
    if (pattern === "datetime") {
        return date.toLocaleString();
    }
    return date.toLocaleDateString();
}

// Keyed registry so new format types (or a future custom-renderer escape hatch) can be
// added without touching columnMapper's cell-building logic.
export const formatters: Record<ColumnFormatType, Formatter> = {
    text: formatText,
    number: formatNumber,
    currency: formatCurrency,
    date: formatDate,
    badge: formatText
};

export function formatCellValue(formatType: ColumnFormatType, value: unknown, pattern?: string): string {
    const formatter = formatters[formatType] ?? formatText;
    return formatter(value, pattern);
}
