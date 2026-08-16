import { makeAutoObservable } from "mobx";
import { ColumnDef, SortDirection, TableRow } from "../types/TableTypes";

export interface TableStoreInit {
    limit?: number;
    sortField?: string;
    sortDirection?: SortDirection;
}

export class TableStore {
    columns: ColumnDef[] = [];
    dataItems: TableRow[] = [];

    // Server-side pagination — offset is derived ((page - 1) * limit), never stored directly.
    page = 1;
    limit: number;
    hasMore = true;
    totalCount: number | undefined = undefined;

    loading = false;
    sortField: string | undefined;
    sortDirection: SortDirection | undefined;
    selectedRows: TableRow[] = [];
    filterText: string | undefined = undefined;

    // Accepts the widget's default page size/sort so the very first render already has the
    // right values — initializing them later via an effect would trigger an extra fetch.
    constructor(init: TableStoreInit = {}) {
        this.limit = init.limit ?? 10;
        this.sortField = init.sortField;
        this.sortDirection = init.sortDirection;
        makeAutoObservable(this);
    }

    get offset(): number {
        return (this.page - 1) * this.limit;
    }

    setColumns(columns: ColumnDef[]): void {
        this.columns = columns;
    }

    setDataItems(items: TableRow[], totalCount?: number): void {
        this.dataItems = items;
        if (totalCount !== undefined) {
            this.totalCount = totalCount;
            this.hasMore = this.offset + items.length < totalCount;
        } else {
            this.hasMore = items.length === this.limit;
        }
    }

    setPage(page: number): void {
        this.page = page;
    }

    setLimit(limit: number): void {
        this.limit = limit;
        this.page = 1;
    }

    setSort(field: string | undefined, direction: SortDirection | undefined): void {
        this.sortField = field;
        this.sortDirection = direction;
        this.page = 1;
    }

    setFilterText(text: string | undefined): void {
        this.filterText = text;
        this.page = 1;
    }

    setSelectedRows(rows: TableRow[]): void {
        this.selectedRows = rows;
    }

    setLoading(loading: boolean): void {
        this.loading = loading;
    }

    reset(): void {
        this.columns = [];
        this.dataItems = [];
        this.page = 1;
        this.limit = 10;
        this.hasMore = true;
        this.totalCount = undefined;
        this.loading = false;
        this.sortField = undefined;
        this.sortDirection = undefined;
        this.selectedRows = [];
        this.filterText = undefined;
    }
}
