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
    /** Dynamic tree rows: the column that holds the expand icon and indentation (default: first column). */
    treeColumn?: boolean;
    formatType: ColumnFormatType;
    formatPattern?: string;
    /** Badge columns: lowercase cell value -> tone name (blue, green, red, orange, purple, gray) or a #hex color. */
    badgeColors?: Record<string, string>;
}

export interface TableRow {
    key: string;
    values: Record<string, unknown>;
}
