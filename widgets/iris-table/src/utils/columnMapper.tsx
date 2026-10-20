import { ReactElement } from "react";
import { TableColumn as RdtColumn } from "react-data-table-component";
import { ColumnAlign, ColumnDef, ColumnFormatType, TableRow } from "../types/TableTypes";
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

// Mendix columns datasource (already reduced to plain values by AxNewCustomTableSync) -> normalized,
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
export function compareValues(a: unknown, b: unknown): number {
    const na = Number(a);
    const nb = Number(b);
    if (a !== "" && b !== "" && a != null && b != null && !Number.isNaN(na) && !Number.isNaN(nb)) {
        return na - nb;
    }
    return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
}

// ColumnDef[] -> react-data-table-component columns. `visible: false` columns are omitted
// entirely rather than passed through with `omit: true`, since they never need to reappear
// without a full column-metadata refresh from Mendix.
export function toRdtColumns(columns: ColumnDef[]): Array<RdtColumn<TableRow>> {
    return columns
        .filter(column => column.visible)
        .map(column => ({
            id: column.key,
            name: column.label,
            sortable: column.sortable,
            sortField: column.key,
            selector: (row: TableRow) => row.values[column.key] as string | number,
            sortFunction: (a: TableRow, b: TableRow) => compareValues(a.values[column.key], b.values[column.key]),
            wrap: column.wrap,
            width: column.width,
            minWidth: column.minWidth,
            grow: column.grow,
            center: column.align === "center",
            right: column.align === "right",
            cell: (row: TableRow) => renderCell(column, row)
        }));
}
