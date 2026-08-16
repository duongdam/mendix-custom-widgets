import { ReactElement } from "react";
import { TableColumn as RdtColumn } from "react-data-table-component";
import { ColumnAlign, ColumnDef, ColumnFormatType, TableRow } from "../types/TableTypes";
import { formatCellValue } from "./formatters";

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
}

function toColumnAlign(value: string | undefined): ColumnAlign {
    return (ALIGN_VALUES as string[]).includes(value ?? "") ? (value as ColumnAlign) : "left";
}

function toFormatType(value: string | undefined): ColumnFormatType {
    return (FORMAT_TYPE_VALUES as string[]).includes(value ?? "") ? (value as ColumnFormatType) : "text";
}

// Mendix columns datasource (already reduced to plain values by AxNewTableSync) -> normalized,
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
            formatPattern: c.formatPattern
        }))
        .sort((a, b) => a.order - b.order);
}

function renderCell(column: ColumnDef, row: TableRow): ReactElement | string {
    const text = formatCellValue(column.formatType, row.values[column.key], column.formatPattern);
    if (column.formatType === "badge") {
        return <span className="ax-table-badge">{text}</span>;
    }
    return text;
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
            wrap: column.wrap,
            width: column.width,
            minWidth: column.minWidth,
            grow: column.grow,
            center: column.align === "center",
            right: column.align === "right",
            cell: (row: TableRow) => renderCell(column, row)
        }));
}
