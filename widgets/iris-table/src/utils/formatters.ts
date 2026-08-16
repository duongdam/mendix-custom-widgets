import { ColumnFormatType } from "../types/TableTypes";

export type Formatter = (value: unknown, pattern?: string) => string;

function formatText(value: unknown): string {
    return value == null ? "" : String(value);
}

function formatNumber(value: unknown, pattern?: string): string {
    const num = Number(value);
    if (Number.isNaN(num)) {
        return "";
    }
    const digits = pattern ? Number(pattern) : undefined;
    const options =
        digits !== undefined && !Number.isNaN(digits)
            ? { minimumFractionDigits: digits, maximumFractionDigits: digits }
            : undefined;
    return new Intl.NumberFormat(undefined, options).format(num);
}

function formatCurrency(value: unknown, pattern?: string): string {
    const num = Number(value);
    if (Number.isNaN(num)) {
        return "";
    }
    return new Intl.NumberFormat(undefined, { style: "currency", currency: pattern || "USD" }).format(num);
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
