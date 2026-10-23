import { makeAutoObservable, observable } from "mobx";
import { ColumnDef, TableRow } from "../types/tableTypes";

export interface TableStoreInit {
    limit?: number;
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
    selectedRows: TableRow[] = [];
    filterText: string | undefined = undefined;
    // Bumped on every search change so client-side paging can jump back to page 1.
    filterVersion = 0;

    // Accepts the widget's default page size so the very first render already has the
    // right values — initializing them later via an effect would trigger an extra fetch.
    constructor(init: TableStoreInit = {}) {
        this.limit = init.limit ?? 10;
        // Row arrays are replaced wholesale, never mutated in place. Tracking them by reference keeps
        // MobX from wrapping every row object in a deep observable (very slow at tens of thousands of rows).
        makeAutoObservable(this, {
            columns: observable.ref,
            dataItems: observable.ref,
            selectedRows: observable.ref
        });
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

    setFilterText(text: string | undefined): void {
        this.filterText = text;
        this.filterVersion += 1;
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
        this.selectedRows = [];
        this.filterText = undefined;
    }
}
