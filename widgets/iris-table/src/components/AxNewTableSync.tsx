import { ReactElement, useCallback, useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import { ValueStatus } from "mendix";
import Big from "big.js";

import { AxNewTableContainerProps } from "../../typings/AxNewTableProps";
import { TableStore } from "../store/TableStore";
import { normalizeColumns, RawColumnInput } from "../utils/columnMapper";
import { parseJsonObject } from "../utils/parseJson";
import { RowState, TableRow } from "../types/TableTypes";
import { NO_STATE, parseStateList } from "../utils/rowState";
import { AxNewTableContainer } from "./AxNewTableContainer";

export interface AxNewTableSyncProps extends AxNewTableContainerProps {
    store: TableStore;
}

function bigToNumber(value: Big | undefined): number | undefined {
    return value === undefined ? undefined : value.toNumber();
}

function AxNewTableSyncComponent(props: AxNewTableSyncProps): ReactElement {
    const { store } = props;

    // --- Columns: Mendix `columns` datasource -> store.columns ---
    const rawColumns = useMemo<RawColumnInput[]>(() => {
        if (props.columns.status !== ValueStatus.Available || !props.columns.items) {
            return [];
        }
        return props.columns.items.map(item => ({
            key: props.columnKeyAttr.get(item)?.value,
            label: props.columnLabelAttr.get(item)?.value,
            order: bigToNumber(props.columnOrderAttr?.get(item)?.value),
            width: props.columnWidthAttr?.get(item)?.value,
            minWidth: props.columnMinWidthAttr?.get(item)?.value,
            grow: bigToNumber(props.columnGrowAttr?.get(item)?.value),
            sortable: props.columnSortableAttr?.get(item)?.value,
            visible: props.columnVisibleAttr?.get(item)?.value,
            align: props.columnAlignAttr?.get(item)?.value,
            wrap: props.columnWrapAttr?.get(item)?.value,
            formatType: props.columnFormatTypeAttr?.get(item)?.value,
            formatPattern: props.columnFormatPatternAttr?.get(item)?.value
        }));
    }, [
        props.columns,
        props.columnKeyAttr,
        props.columnLabelAttr,
        props.columnOrderAttr,
        props.columnWidthAttr,
        props.columnMinWidthAttr,
        props.columnGrowAttr,
        props.columnSortableAttr,
        props.columnVisibleAttr,
        props.columnAlignAttr,
        props.columnWrapAttr,
        props.columnFormatTypeAttr,
        props.columnFormatPatternAttr
    ]);

    useEffect(() => {
        if (props.columns.status === ValueStatus.Available) {
            store.setColumns(normalizeColumns(rawColumns));
        }
    }, [rawColumns, props.columns.status, store]);

    // --- Rows: Mendix `dataItems` datasource -> store.dataItems ---
    const rows = useMemo<TableRow[]>(() => {
        if (props.dataItems.status !== ValueStatus.Available || !props.dataItems.items) {
            return [];
        }
        return props.dataItems.items.map(item => ({
            key: String(props.rowKeyAttr.get(item)?.value ?? ""),
            values: parseJsonObject(props.rowValuesAttr.get(item)?.value)
        }));
    }, [props.dataItems, props.rowKeyAttr, props.rowValuesAttr]);

    useEffect(() => {
        if (props.dataItems.status !== ValueStatus.Available) {
            return;
        }
        const totalCount = bigToNumber(props.totalCountAttribute?.value);
        // "loadMore" only appends once past page 1 — page 1 always replaces, which also covers
        // every reset (search/sort/limit change resets the store back to page 1).
        const shouldAppend = props.paginationMode === "loadMore" && store.page > 1;
        store.setDataItems(shouldAppend ? [...store.dataItems, ...rows] : rows, totalCount);
        store.setLoading(false);
        // store.dataItems is read (for the append concat) but must not be a dependency: this
        // effect is what writes it, so depending on it would immediately re-run against its own output.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, props.dataItems.status, props.totalCountAttribute, props.paginationMode, store]);

    // --- Action column: Mendix `rowStateItems` datasource -> store.rowStates ---
    const { rowStateItems, stateRowKeyAttr, stateAttr, statePercentAttr, stateMessageAttr } = props;
    const rowStates = useMemo(() => {
        const map = new Map<string, RowState>();
        if (rowStateItems?.status !== ValueStatus.Available || !rowStateItems.items) {
            return map;
        }
        for (const item of rowStateItems.items) {
            const key = stateRowKeyAttr?.get(item)?.value;
            if (key === undefined) {
                continue;
            }
            const percent = bigToNumber(statePercentAttr?.get(item)?.value);
            map.set(String(key), {
                state: (stateAttr?.get(item)?.value || NO_STATE).toLowerCase(),
                percent:
                    percent !== undefined && Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : undefined,
                message: stateMessageAttr?.get(item)?.value || undefined
            });
        }
        return map;
    }, [rowStateItems, stateRowKeyAttr, stateAttr, statePercentAttr, stateMessageAttr]);

    useEffect(() => {
        // Keep the last known states while the datasource is reloading, so bars don't flicker.
        if (rowStateItems?.status === ValueStatus.Loading) {
            return;
        }
        store.setRowStates(rowStates);
    }, [rowStates, rowStateItems?.status, store]);

    // Poll the state datasource only while some row is in a progress state. The ref keeps the
    // interval from restarting on every reload (each reload hands us a new ListValue object).
    const progressStates = useMemo(() => parseStateList(props.progressStates), [props.progressStates]);
    const hasActiveProgress = useMemo(
        () => [...rowStates.values()].some(rowState => progressStates.has(rowState.state)),
        [rowStates, progressStates]
    );
    const rowStateItemsRef = useRef(rowStateItems);
    useEffect(() => {
        rowStateItemsRef.current = rowStateItems;
    }, [rowStateItems]);

    useEffect(() => {
        if (!hasActiveProgress || props.progressRefreshInterval <= 0) {
            return;
        }
        const timer = window.setInterval(() => rowStateItemsRef.current?.reload(), props.progressRefreshInterval);
        return () => window.clearInterval(timer);
    }, [hasActiveProgress, props.progressRefreshInterval]);

    // --- Pagination/sort/search: store -> Mendix attributes + fetchDataAction ---
    // Reading these store fields here (component is wrapped in `observer`) is what makes the
    // effect below re-run only when one of them actually changes, with fresh `props` each time —
    // deliberately not using a long-lived mobx `reaction`, which would close over stale
    // action/attribute prop references from mount time instead.
    const { page, limit, sortField, sortDirection, filterText } = store;
    const previousSortRef = useRef<{ field: string | undefined; direction: string | undefined }>({
        field: undefined,
        direction: undefined
    });

    useEffect(() => {
        const offset = (page - 1) * limit;
        props.offsetAttribute?.setValue(new Big(offset));
        props.limitAttribute?.setValue(new Big(limit));
        props.sortFieldAttribute?.setValue(sortField);
        props.sortDirectionAttribute?.setValue(sortDirection);
        props.filterTextAttribute?.setValue(filterText);

        store.setLoading(true);
        if (props.fetchDataAction?.canExecute) {
            props.fetchDataAction.execute();
        }

        const sortChanged =
            previousSortRef.current.field !== sortField || previousSortRef.current.direction !== sortDirection;
        if (sortChanged) {
            previousSortRef.current = { field: sortField, direction: sortDirection };
            if (sortField && props.onSortAction?.canExecute) {
                props.onSortAction.execute({ sortField, sortDirection: sortDirection ?? "asc" });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, sortField, sortDirection, filterText]);

    const handleSelectionChange = useCallback(
        (selected: TableRow[]) => {
            store.setSelectedRows(selected);
            if (props.onSelectionChangeAction?.canExecute) {
                props.onSelectionChangeAction.execute({ selectedKeys: selected.map(row => row.key).join(",") });
            }
        },
        [props.onSelectionChangeAction, store]
    );

    const handleRowClick = useCallback(
        (row: TableRow) => {
            if (props.onRowClick?.canExecute) {
                props.onRowClick.execute({ rowKey: row.key });
            }
        },
        [props.onRowClick]
    );

    if (props.columns.status !== ValueStatus.Available) {
        return <div className="ax-table-loading">{props.loadingText}</div>;
    }

    return (
        <AxNewTableContainer
            {...props}
            store={store}
            onSelectionChange={handleSelectionChange}
            onRowClickHandler={handleRowClick}
        />
    );
}

export const AxNewTableSync = observer(AxNewTableSyncComponent);
