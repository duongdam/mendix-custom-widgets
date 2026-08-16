export type ColumnAlign = "left" | "center" | "right";

export type ColumnFormatType = "text" | "number" | "currency" | "date" | "badge";

export type SortDirection = "asc" | "desc";

export type PaginationMode = "pages" | "loadMore";

export interface ColumnDef {
    key: string;
    label: string;
    order: number;
    width?: string;
    minWidth?: string;
    grow?: number;
    sortable: boolean;
    visible: boolean;
    align: ColumnAlign;
    wrap: boolean;
    formatType: ColumnFormatType;
    formatPattern?: string;
}

export interface TableRow {
    key: string;
    values: Record<string, unknown>;
}
