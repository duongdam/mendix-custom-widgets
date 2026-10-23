import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { IrisAntdProvider } from "@iris/antd-kit";

import { AxNewCustomTableContainerProps } from "../../typings/AxNewCustomTableProps";
import { TableStore } from "../store/TableStore";
import { TableRow } from "../types/tableTypes";
import { formatCellValue } from "../utils/formatters";
import { useDebounce } from "../hooks/useDebounce";
import { hasHierarchy, withAncestors } from "../utils/rowTree";
import { AntdTable } from "./AntdTable";

export interface TableContainerProps extends AxNewCustomTableContainerProps {
    store: TableStore;
    onSelectionChange: (rows: TableRow[]) => void;
    onRowClickHandler: (row: TableRow) => void;
    onRowDoubleClickHandler: (row: TableRow) => void;
}

function parsePageSizeOptions(csv: string): number[] {
    const parsed = csv
        .split(",")
        .map(part => Number(part.trim()))
        .filter(n => Number.isFinite(n) && n > 0);
    return parsed.length > 0 ? parsed : [10, 20, 50, 100];
}

interface SearchBoxProps {
    placeholder: string;
    debounceMs: number;
    onChange: (text: string) => void;
}

function SearchBox({ placeholder, debounceMs, onChange }: SearchBoxProps): ReactElement {
    const [value, setValue] = useState("");
    const debounced = useDebounce(value, debounceMs);

    useEffect(() => {
        onChange(debounced);
        // Only the debounced value should trigger the callback — `onChange` itself is a fresh
        // closure every render and must not restart the debounce timer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);

    return (
        <input
            type="text"
            className="ax-custom-table-search-input"
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
        />
    );
}

function TableContainerComponent(props: TableContainerProps): ReactElement {
    const { store } = props;

    const pageSizeOptions = useMemo(() => parsePageSizeOptions(props.prpPageSizeOptions), [props.prpPageSizeOptions]);

    const isDynamic = props.prpDataMode === "dynamic";
    // Dynamic mode has all rows in memory: paging, sort and search run client-side, and "Load more"
    // makes no sense, so it always uses the page footer.
    const isPagesMode = isDynamic || props.prpPaginationMode === "pages";
    const serverSide = !isDynamic;

    const filterText = store.filterText?.trim().toLowerCase();
    // "Enable Expandable Rows" with ParentRowKey links in the data: rows expand into their child
    // rows. Without any ParentRowKey there is nothing to expand and no icon is shown.
    const isTree = useMemo(
        () => props.prpExpandableRows && hasHierarchy(store.dataItems),
        [props.prpExpandableRows, store.dataItems]
    );

    // Lowercased searchable text of every row, built once on the first search so each following
    // keystroke is only a cheap substring scan (formatting every cell per keystroke is far too slow
    // for hundreds of thousands of rows).
    const hasSearched = useRef(false);
    hasSearched.current ||= Boolean(filterText);
    const searchIndex = useMemo(() => {
        if (!isDynamic || !hasSearched.current) {
            return undefined;
        }
        const visibleColumns = store.columns.filter(column => column.visible);
        return store.dataItems.map(row =>
            visibleColumns
                .map(column => formatCellValue(column.formatType, row.values[column.key], column.formatPattern))
                .join("\u0001")
                .toLowerCase()
        );
        // The index is rebuilt only for new data/columns, not for every change of the search text.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDynamic, hasSearched.current, store.dataItems, store.columns]);

    const visibleRows = useMemo(() => {
        if (!isDynamic || !filterText || !searchIndex) {
            return store.dataItems;
        }
        const matched = store.dataItems.filter((_, index) => searchIndex[index]?.includes(filterText));
        return isTree ? withAncestors(store.dataItems, matched) : matched;
    }, [isDynamic, isTree, filterText, searchIndex, store.dataItems]);

    const paginationTotalRows =
        store.totalCount ?? store.offset + store.dataItems.length + (store.hasMore ? store.limit : 0);
    // Datasource: the server-side total. Dynamic: the rows currently shown (after search).
    const totalItems = serverSide ? paginationTotalRows : visibleRows.length;
    const totalText = props.prpTotalText.split("{count}").join(totalItems.toLocaleString());
    const isVirtual = isDynamic && props.prpScrollMode === "virtual";

    return (
        <IrisAntdProvider>
            <div className="ax-custom-table-container">
                {(totalText || props.prpShowSearch) && (
                    <div className="ax-custom-table-toolbar">
                        <span className="ax-custom-table-total">{totalText}</span>
                        {props.prpShowSearch && (
                            <SearchBox
                                placeholder={props.prpSearchPlaceholder}
                                debounceMs={props.prpSearchDebounce}
                                onChange={text => store.setFilterText(text || undefined)}
                            />
                        )}
                    </div>
                )}
                <AntdTable
                    store={store}
                    widgetProps={props}
                    rows={visibleRows}
                    serverSide={serverSide}
                    virtual={isVirtual}
                    tree={isTree}
                    paginate={props.prpEnableServerPagination && isPagesMode}
                    totalRows={paginationTotalRows}
                    pageSizeOptions={pageSizeOptions}
                    loading={store.loading || props.prpIsLoading?.value === true}
                    onSelectionChange={props.onSelectionChange}
                    onRowClick={props.onRowClickHandler}
                    onRowDoubleClick={props.onRowDoubleClickHandler}
                />
                {!isPagesMode && (
                    <div className="ax-custom-table-load-more">
                        <button
                            type="button"
                            className="ax-custom-table-load-more-button"
                            disabled={!store.hasMore || store.loading}
                            onClick={() => store.setPage(store.page + 1)}
                        >
                            {store.loading ? props.prpLoadingText : props.prpLoadMoreText}
                        </button>
                    </div>
                )}
            </div>
        </IrisAntdProvider>
    );
}

export const TableContainer = observer(TableContainerComponent);
