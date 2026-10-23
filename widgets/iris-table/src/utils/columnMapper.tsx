import { ReactElement } from "react";
import { TableColumnsType } from "antd";
import { ColumnAlign, ColumnDef, ColumnFormatType, TableRow } from "../types/tableTypes";
import { formatCellValue } from "./formatters";
import { BadgeCell } from "../components/BadgeCell";

const ALIGN_VALUES: ColumnAlign[] = ["left", "center", "right"];
const FORMAT_TYPE_VALUES: ColumnFormatType[] = ["text", "number", "currency", "date", "badge"];

export interface RawColumnInput {
    key: string | undefined;
    label: string | undefined;
    order?: number;
    width?: string;
    minWidth?: string;
    grow?: number;
    sortable?: boolean;
    visible?: boolean;
    align?: string;
    wrap?: boolean;
    treeColumn?: boolean;
    formatType?: string;
    formatPattern?: string;
    badgeColors?: Record<string, string>;
}

function toColumnAlign(value: string | undefined): ColumnAlign {
    return (ALIGN_VALUES as string[]).includes(value ?? "") ? (value as ColumnAlign) : "left";
}

function toFormatType(value: string | undefined): ColumnFormatType {
    return (FORMAT_TYPE_VALUES as string[]).includes(value ?? "") ? (value as ColumnFormatType) : "text";
}

// Mendix columns datasource (already reduced to plain values by TableDataSync) -> normalized,
// sorted, defaulted ColumnDef[]. Kept as a pure function so it stays easy to unit test.
export function normalizeColumns(raw: RawColumnInput[]): ColumnDef[] {
    return raw
        .filter((c): c is RawColumnInput & { key: string; label: string } => Boolean(c.key && c.label))
        .map((c, index) => ({
            key: c.key,
            label: c.label,
            order: c.order ?? index,
            width: c.width,
            minWidth: c.minWidth,
            grow: c.grow,
            sortable: c.sortable ?? false,
            visible: c.visible ?? true,
            align: toColumnAlign(c.align),
            wrap: c.wrap ?? false,
            treeColumn: c.treeColumn,
            formatType: toFormatType(c.formatType),
            formatPattern: c.formatPattern,
            badgeColors: c.badgeColors
        }))
        .sort((a, b) => a.order - b.order);
}

export function renderCell(column: ColumnDef, row: TableRow): ReactElement | string {
    const text = formatCellValue(column.formatType, row.values[column.key], column.formatPattern);
    if (column.formatType === "badge") {
        return <BadgeCell text={text} badgeColors={column.badgeColors} />;
    }
    return text;
}

// Only used for client-side sorting (dynamic mode). Numeric values compare numerically, so "9" < "10".
const COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export function compareValues(a: unknown, b: unknown): number {
    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }
    const na = Number(a);
    const nb = Number(b);
    if (a !== "" && b !== "" && a != null && b != null && !Number.isNaN(na) && !Number.isNaN(nb)) {
        return na - nb;
    }
    // One shared collator: creating it per comparison (what localeCompare with options does) is very slow.
    return COLLATOR.compare(String(a ?? ""), String(b ?? ""));
}

const DEFAULT_MIN_WIDTH = 100;

function parsePx(value: string | undefined): number | undefined {
    const parsed = parseFloat(value ?? "");
    return Number.isFinite(parsed) && /^\s*[\d.]+\s*(px)?\s*$/i.test(value ?? "") ? parsed : undefined;
}

// Virtual scrolling needs every column width as a plain number of pixels. Columns with a `width`
// are fixed; the rest share whatever room is left in the container in proportion to `grow`
// (default 1), never going below their `minWidth`.
export function virtualWidths(columns: ColumnDef[], containerWidth: number): number[] {
    const visible = columns.filter(column => column.visible);
    const fixed = visible.map(column => parsePx(column.width));
    const fixedTotal = fixed.reduce<number>((sum, width) => sum + (width ?? 0), 0);
    const flexible = visible.filter((_, index) => fixed[index] === undefined);
    const totalGrow = flexible.reduce((sum, column) => sum + (column.grow ?? 1), 0);
    const free = Math.max(containerWidth - fixedTotal, 0);
    return visible.map((column, index) => {
        const width = fixed[index];
        if (width !== undefined) {
            return width;
        }
        const min = parsePx(column.minWidth) ?? DEFAULT_MIN_WIDTH;
        return Math.max(min, Math.floor((free * (column.grow ?? 1)) / (totalGrow || 1)));
    });
}

// ColumnDef[] -> antd Table columns. `visible: false` columns are omitted entirely rather than
// hidden, since they never need to reappear without a full column-metadata refresh from Mendix.
// `grow` has no antd equivalent and is ignored.
export function toAntdColumns(columns: ColumnDef[], virtualWidth?: number[]): TableColumnsType<TableRow> {
    const virtual = virtualWidth !== undefined;
    return columns
        .filter(column => column.visible)
        .map((column, index) => ({
            key: column.key,
            title: column.label,
            align: column.align,
            width: virtualWidth ? virtualWidth[index] : column.width,
            ellipsis: virtual && !column.wrap,
            sorter: column.sortable
                ? (a: TableRow, b: TableRow) => compareValues(a.values[column.key], b.values[column.key])
                : undefined,
            // `title` shows the full text in the browser's hover tooltip when a cell is truncated.
            onCell: (row: TableRow) => ({
                title: formatCellValue(column.formatType, row.values[column.key], column.formatPattern),
                style: virtual
                    ? undefined
                    : {
                          minWidth: column.minWidth,
                          whiteSpace: column.wrap ? ("normal" as const) : ("nowrap" as const),
                          // A fixed-width column truncates long text instead of growing past its width.
                          ...(column.width && !column.wrap
                              ? { maxWidth: column.width, overflow: "hidden", textOverflow: "ellipsis" }
                              : {})
                      }
            }),
            render: (_: unknown, row: TableRow) => renderCell(column, row)
        }));
}
