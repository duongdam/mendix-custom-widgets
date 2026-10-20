import { MouseEvent, ReactElement, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { IrisAntdProvider } from "@iris/antd-kit";
import DataTable, {
    ConditionalStyles,
    ExpanderComponentProps,
    TableColumn as RdtColumn
} from "react-data-table-component";

import { AxNewCustomTableContainerProps } from "../../typings/AxNewCustomTableProps";
import { TableStore } from "../store/TableStore";
import { TableRow } from "../types/TableTypes";
import { toRdtColumns } from "../utils/columnMapper";
import { formatCellValue } from "../utils/formatters";
import { useDebounce } from "../hooks/useDebounce";
import { isRowInvalid } from "../utils/parseTableJson";
import { parsePixelHeight, VirtualTable } from "./VirtualTable";

export interface AxNewCustomTableContainerComponentProps extends AxNewCustomTableContainerProps {
    store: TableStore;
    onSelectionChange: (rows: TableRow[]) => void;
    onRowClickHandler: (row: TableRow) => void;
    onRowDoubleClickHandler: (row: TableRow) => void;
}

const INVALID_ROW_STYLES: Array<ConditionalStyles<TableRow>> = [
    {
        when: isRowInvalid,
        style: { opacity: 0.5, cursor: "not-allowed", backgroundColor: "#fafafa" }
    }
];

// Clicking anywhere on a row behaves like clicking its checkbox. Done by clicking the real
// checkbox, so react-data-table keeps handling single/multi selection and select-all state.
function toggleRowCheckbox(event: MouseEvent<Element>): void {
    const target = event.target as HTMLElement;
    // Clicks on the checkbox itself or any other control (buttons, links, inputs) are left alone.
    if (target.closest("input, button, a, label, [role=button]")) {
        return;
    }
    const checkbox = (event.currentTarget as HTMLElement).querySelector<HTMLInputElement>(
        "input[type=checkbox], input[type=radio]"
    );
    if (checkbox && !checkbox.disabled) {
        checkbox.click();
    }
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
        <div className="ax-custom-table-subheader">
            <input
                type="text"
                className="ax-custom-table-search-input"
                placeholder={placeholder}
                value={value}
                onChange={e => setValue(e.target.value)}
            />
        </div>
    );
}

function AxNewCustomTableContainerComponent(props: AxNewCustomTableContainerComponentProps): ReactElement {
    const { store } = props;

    const { columns } = store;

    const rdtColumns = useMemo<Array<RdtColumn<TableRow>>>(() => toRdtColumns(columns), [columns]);

    const pageSizeOptions = useMemo(() => parsePageSizeOptions(props.prpPageSizeOptions), [props.prpPageSizeOptions]);

    // Built once per widget instance (store never changes identity) so react-data-table-component
    // doesn't treat every render as a brand-new expandable-row component and force-collapse rows.
    const ExpandedRow = useMemo(() => {
        function ExpandedRowComponent({ data }: ExpanderComponentProps<TableRow>): ReactElement {
            return (
                <div className="ax-custom-table-expanded-row">
                    {store.columns
                        .filter(column => column.visible)
                        .map(column => {
                            const text = formatCellValue(
                                column.formatType,
                                data.values[column.key],
                                column.formatPattern
                            );
                            return (
                                <div key={column.key} className="ax-custom-table-expanded-row-item">
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

    const isDynamic = props.prpDataMode === "dynamic";
    // Dynamic mode has all rows in memory: paging, sort and search run client-side, and "Load more"
    // makes no sense, so it always uses the page footer.
    const isPagesMode = isDynamic || props.prpPaginationMode === "pages";
    const serverSide = !isDynamic;

    const filterText = store.filterText?.trim().toLowerCase();
    const visibleRows = useMemo(() => {
        if (!isDynamic || !filterText) {
            return store.dataItems;
        }
        const visibleColumns = store.columns.filter(column => column.visible);
        return store.dataItems.filter(row =>
            visibleColumns.some(column =>
                formatCellValue(column.formatType, row.values[column.key], column.formatPattern)
                    .toLowerCase()
                    .includes(filterText)
            )
        );
    }, [isDynamic, filterText, store.dataItems, store.columns]);

    // react-data-table-component returns to its first page whenever this value changes.
    const paginationReset = store.filterVersion % 2 === 1;
    const paginationTotalRows =
        store.totalCount ?? store.offset + store.dataItems.length + (store.hasMore ? store.limit : 0);

    const isVirtual = isDynamic && props.prpScrollMode === "virtual";
    if (isVirtual) {
        return (
            <IrisAntdProvider>
                <div className="ax-custom-table-container">
                    {props.prpShowSearch && (
                        <SearchBox
                            placeholder={props.prpSearchPlaceholder}
                            debounceMs={props.prpSearchDebounce}
                            onChange={text => store.setFilterText(text || undefined)}
                        />
                    )}
                    <VirtualTable
                        columns={columns.filter(column => column.visible)}
                        rows={visibleRows}
                        allRows={store.dataItems}
                        loading={store.loading || props.prpIsLoading?.value === true}
                        loadingText={props.prpLoadingText}
                        noDataText={props.prpNoDataText}
                        maxHeight={parsePixelHeight(props.prpFixedHeaderScrollHeight, 400)}
                        rowHeight={props.prpDense ? 32 : 48}
                        selectable={props.prpEnableRowSelection}
                        singleSelect={props.prpSelectableRowsSingle}
                        highlightSelected={props.prpSelectableRowsHighlight}
                        striped={props.prpStriped}
                        highlightOnHover={props.prpHighlightOnHover}
                        pointerOnHover={props.prpPointerOnHover}
                        onSelectionChange={props.onSelectionChange}
                        onRowClick={props.onRowClickHandler}
                        onRowDoubleClick={props.onRowDoubleClickHandler}
                    />
                </div>
            </IrisAntdProvider>
        );
    }

    return (
        <IrisAntdProvider>
            <div className="ax-custom-table-container">
                <DataTable<TableRow>
                    columns={rdtColumns}
                    data={visibleRows}
                    keyField="key"
                    pagination={props.prpEnableServerPagination && isPagesMode}
                    paginationServer={serverSide}
                    paginationPage={serverSide ? store.page : undefined}
                    paginationDefaultPage={serverSide ? store.page : 1}
                    paginationResetDefaultPage={paginationReset}
                    paginationPerPage={store.limit}
                    paginationTotalRows={serverSide ? paginationTotalRows : visibleRows.length}
                    paginationRowsPerPageOptions={pageSizeOptions}
                    onChangePage={newPage => serverSide && store.setPage(newPage)}
                    onChangeRowsPerPage={newLimit => store.setLimit(newLimit)}
                    selectableRows={props.prpEnableRowSelection}
                    selectableRowsHighlight={props.prpSelectableRowsHighlight}
                    selectableRowsSingle={props.prpSelectableRowsSingle}
                    selectableRowDisabled={isRowInvalid}
                    conditionalRowStyles={INVALID_ROW_STYLES}
                    onSelectedRowsChange={state => props.onSelectionChange(state.selectedRows)}
                    expandableRows={props.prpExpandableRows}
                    expandableRowsComponent={ExpandedRow}
                    expandOnRowClicked={props.prpExpandOnRowClicked}
                    onRowDoubleClicked={row => {
                        if (!isRowInvalid(row)) {
                            props.onRowDoubleClickHandler(row);
                        }
                    }}
                    onRowClicked={(row, event) => {
                        if (isRowInvalid(row)) {
                            return;
                        }
                        toggleRowCheckbox(event);
                        props.onRowClickHandler(row);
                    }}
                    pointerOnHover={props.prpPointerOnHover}
                    striped={props.prpStriped}
                    highlightOnHover={props.prpHighlightOnHover}
                    dense={props.prpDense}
                    responsive={props.prpResponsive}
                    fixedHeader={props.prpFixedHeader}
                    fixedHeaderScrollHeight={props.prpFixedHeaderScrollHeight}
                    persistTableHead={props.prpPersistTableHead}
                    progressPending={store.loading || props.prpIsLoading?.value === true}
                    progressComponent={<div className="ax-custom-table-loading">{props.prpLoadingText}</div>}
                    noDataComponent={<div className="ax-custom-table-loading">{props.prpNoDataText}</div>}
                    subHeader={
                        props.prpShowSearch ? (
                            <SearchBox
                                placeholder={props.prpSearchPlaceholder}
                                debounceMs={props.prpSearchDebounce}
                                onChange={text => store.setFilterText(text || undefined)}
                            />
                        ) : undefined
                    }
                />
                {!isPagesMode && (
                    <div className="ax-custom-table-load-more">
                        <button
                            type="button"
                            className="ax-custom-table-load-more-button"
                            disabled={!store.hasMore || store.loading}
                            onClick={() => store.setPage(store.page + 1)}
                        >
                            {store.loading ? props.prpLoadingText : "Load more"}
                        </button>
                    </div>
                )}
            </div>
        </IrisAntdProvider>
    );
}

export const AxNewCustomTableContainer = observer(AxNewCustomTableContainerComponent);
