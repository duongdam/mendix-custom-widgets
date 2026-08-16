import { ReactElement, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import DataTable, { ExpanderComponentProps, SortOrder, TableColumn as RdtColumn } from "react-data-table-component";

import { AxNewTableContainerProps } from "../../typings/AxNewTableProps";
import { TableStore } from "../store/TableStore";
import { TableRow } from "../types/TableTypes";
import { toRdtColumns } from "../utils/columnMapper";
import { formatCellValue } from "../utils/formatters";
import { useDebounce } from "../hooks/useDebounce";

export interface AxNewTableContainerComponentProps extends AxNewTableContainerProps {
    store: TableStore;
    onSelectionChange: (rows: TableRow[]) => void;
    onRowClickHandler: (row: TableRow) => void;
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
        <div className="ax-table-subheader">
            <input
                type="text"
                className="ax-table-search-input"
                placeholder={placeholder}
                value={value}
                onChange={e => setValue(e.target.value)}
            />
        </div>
    );
}

function AxNewTableContainerComponent(props: AxNewTableContainerComponentProps): ReactElement {
    const { store } = props;

    const rdtColumns = useMemo<Array<RdtColumn<TableRow>>>(() => toRdtColumns(store.columns), [store.columns]);

    const pageSizeOptions = useMemo(() => parsePageSizeOptions(props.pageSizeOptions), [props.pageSizeOptions]);

    // Built once per widget instance (store never changes identity) so react-data-table-component
    // doesn't treat every render as a brand-new expandable-row component and force-collapse rows.
    const ExpandedRow = useMemo(() => {
        function ExpandedRowComponent({ data }: ExpanderComponentProps<TableRow>): ReactElement {
            return (
                <div className="ax-table-expanded-row">
                    {store.columns.map(column => {
                        const text = formatCellValue(column.formatType, data.values[column.key], column.formatPattern);
                        return (
                            <div key={column.key} className="ax-table-expanded-row-item">
                                <strong>{column.label}: </strong>
                                <span>{text}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return observer(ExpandedRowComponent);
    }, [store]);

    const isPagesMode = props.paginationMode === "pages";
    const paginationTotalRows =
        store.totalCount ?? store.offset + store.dataItems.length + (store.hasMore ? store.limit : 0);

    return (
        <div className="ax-table-container">
            <DataTable<TableRow>
                columns={rdtColumns}
                data={store.dataItems}
                keyField="key"
                pagination={props.enableServerPagination && isPagesMode}
                paginationServer
                paginationPage={store.page}
                paginationDefaultPage={store.page}
                paginationPerPage={store.limit}
                paginationTotalRows={paginationTotalRows}
                paginationRowsPerPageOptions={pageSizeOptions}
                onChangePage={newPage => store.setPage(newPage)}
                onChangeRowsPerPage={newLimit => store.setLimit(newLimit)}
                sortServer={props.enableServerSort}
                defaultSortFieldId={props.defaultSortFieldKey || undefined}
                defaultSortAsc={props.defaultSortAsc}
                onSort={(column: RdtColumn<TableRow>, direction: SortOrder) => {
                    if (props.enableServerSort) {
                        store.setSort(
                            String(column.sortField ?? column.id ?? ""),
                            direction === SortOrder.DESC ? "desc" : "asc"
                        );
                    }
                }}
                selectableRows={props.enableRowSelection}
                selectableRowsHighlight={props.selectableRowsHighlight}
                selectableRowsSingle={props.selectableRowsSingle}
                onSelectedRowsChange={state => props.onSelectionChange(state.selectedRows)}
                expandableRows={props.expandableRows}
                expandableRowsComponent={ExpandedRow}
                expandOnRowClicked={props.expandOnRowClicked}
                onRowClicked={row => props.onRowClickHandler(row)}
                pointerOnHover={props.pointerOnHover}
                striped={props.striped}
                highlightOnHover={props.highlightOnHover}
                dense={props.dense}
                responsive={props.responsive}
                fixedHeader={props.fixedHeader}
                fixedHeaderScrollHeight={props.fixedHeaderScrollHeight}
                persistTableHead={props.persistTableHead}
                progressPending={store.loading}
                progressComponent={<div className="ax-table-loading">{props.loadingText}</div>}
                noDataComponent={<div className="ax-table-loading">{props.noDataText}</div>}
                subHeader={
                    props.showSearch ? (
                        <SearchBox
                            placeholder={props.searchPlaceholder}
                            debounceMs={props.searchDebounce}
                            onChange={text => store.setFilterText(text || undefined)}
                        />
                    ) : undefined
                }
            />
            {!isPagesMode && (
                <div className="ax-table-load-more">
                    <button
                        type="button"
                        className="ax-table-load-more-button"
                        disabled={!store.hasMore || store.loading}
                        onClick={() => store.setPage(store.page + 1)}
                    >
                        {store.loading ? props.loadingText : "Load more"}
                    </button>
                </div>
            )}
        </div>
    );
}

export const AxNewTableContainer = observer(AxNewTableContainerComponent);
