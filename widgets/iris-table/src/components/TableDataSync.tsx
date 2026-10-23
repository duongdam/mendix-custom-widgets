import { ReactElement, useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { ValueStatus } from "mendix";
import Big from "big.js";

import { AxNewCustomTableContainerProps } from "../../typings/AxNewCustomTableProps";
import { TableStore } from "../store/TableStore";
import { normalizeColumns, RawColumnInput } from "../utils/columnMapper";
import { parseJsonObject } from "../utils/parseRowValues";
import { parseDataJson, parseHeaderJson } from "../utils/parseDynamicJson";
import { TableRow } from "../types/tableTypes";
import { TableContainer } from "./TableContainer";

export interface TableDataSyncProps extends AxNewCustomTableContainerProps {
    store: TableStore;
}

function bigToNumber(value: Big | undefined): number | undefined {
    return value === undefined ? undefined : value.toNumber();
}

function TableDataSyncComponent(props: TableDataSyncProps): ReactElement {
    const { store } = props;
    const isDynamic = props.prpDataMode === "dynamic";

    // --- Dynamic mode: headerJson + dataJson -> store (everything loaded at once) ---
    const headerJsonValue = props.prpHeaderJson?.value;
    const dataJsonValue = props.prpDataJson?.value;
    useEffect(() => {
        if (isDynamic) {
            store.setColumns(parseHeaderJson(headerJsonValue));
        }
    }, [isDynamic, headerJsonValue, store]);
    useEffect(() => {
        if (isDynamic) {
            const items = parseDataJson(dataJsonValue);
            store.setDataItems(items, items.length);
        }
    }, [isDynamic, dataJsonValue, store]);

    // --- Columns: Mendix `columns` datasource -> store.columns ---
    const rawColumns = useMemo<RawColumnInput[]>(() => {
        if (!props.prpColumns || props.prpColumns.status !== ValueStatus.Available || !props.prpColumns.items) {
            return [];
        }
        return props.prpColumns.items.map(item => ({
            key: props.prpColumnKeyAttr?.get(item)?.value,
            label: props.prpColumnLabelAttr?.get(item)?.value,
            width: props.prpColumnWidthAttr?.get(item)?.value,
            sortable: props.prpColumnSortableAttr?.get(item)?.value,
            visible: props.prpColumnVisibleAttr?.get(item)?.value
        }));
    }, [
        props.prpColumns,
        props.prpColumnKeyAttr,
        props.prpColumnLabelAttr,
        props.prpColumnWidthAttr,
        props.prpColumnSortableAttr,
        props.prpColumnVisibleAttr
    ]);

    useEffect(() => {
        if (!isDynamic && props.prpColumns?.status === ValueStatus.Available) {
            store.setColumns(normalizeColumns(rawColumns));
        }
    }, [isDynamic, rawColumns, props.prpColumns?.status, store]);

    // --- Rows: Mendix `dataItems` datasource -> store.dataItems ---
    const rows = useMemo<TableRow[]>(() => {
        if (!props.prpDataItems || props.prpDataItems.status !== ValueStatus.Available || !props.prpDataItems.items) {
            return [];
        }
        return props.prpDataItems.items.map(item => ({
            key: String(props.prpRowKeyAttr?.get(item)?.value ?? ""),
            values: parseJsonObject(props.prpRowValuesAttr?.get(item)?.value)
        }));
    }, [props.prpDataItems, props.prpRowKeyAttr, props.prpRowValuesAttr]);

    useEffect(() => {
        if (isDynamic || props.prpDataItems?.status !== ValueStatus.Available) {
            return;
        }
        const totalCount = bigToNumber(props.prpTotalCountAttribute?.value);
        // "loadMore" only appends once past page 1 — page 1 always replaces, which also covers
        // every reset (search/limit change resets the store back to page 1).
        const shouldAppend = props.prpPaginationMode === "loadMore" && store.page > 1;
        store.setDataItems(shouldAppend ? [...store.dataItems, ...rows] : rows, totalCount);
        store.setLoading(false);
        // store.dataItems is read (for the append concat) but must not be a dependency: this
        // effect is what writes it, so depending on it would immediately re-run against its own output.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDynamic, rows, props.prpDataItems?.status, props.prpTotalCountAttribute, props.prpPaginationMode, store]);

    // --- Pagination/search: store -> Mendix attributes + fetchDataAction ---
    // Reading these store fields here (component is wrapped in `observer`) is what makes the
    // effect below re-run only when one of them actually changes, with fresh `props` each time —
    // deliberately not using a long-lived mobx `reaction`, which would close over stale
    // action/attribute prop references from mount time instead.
    const { page, limit, filterText } = store;

    useEffect(() => {
        // Dynamic mode never calls back into Mendix — paging/search happen in the browser.
        if (isDynamic) {
            return;
        }
        const offset = (page - 1) * limit;
        props.prpOffsetAttribute?.setValue(new Big(offset));
        props.prpLimitAttribute?.setValue(new Big(limit));
        props.prpFilterTextAttribute?.setValue(filterText);

        store.setLoading(true);
        if (props.prpFetchDataAction?.canExecute) {
            props.prpFetchDataAction.execute();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDynamic, page, limit, filterText]);

    const handleSelectionChange = useCallback(
        (selected: TableRow[]) => {
            store.setSelectedRows(selected);
            if (props.prpOnSelectionChangeAction?.canExecute) {
                props.prpOnSelectionChangeAction.execute({ selectedKeys: selected.map(row => row.key).join(",") });
            }
        },
        [props.prpOnSelectionChangeAction, store]
    );

    const handleRowClick = useCallback(
        (row: TableRow) => {
            if (props.prpOnRowClick?.canExecute) {
                props.prpOnRowClick.execute({ rowKey: row.key });
            }
        },
        [props.prpOnRowClick]
    );

    const handleRowDoubleClick = useCallback(
        (row: TableRow) => {
            if (props.prpOnRowDoubleClick?.canExecute) {
                props.prpOnRowDoubleClick.execute({ rowKey: row.key });
            }
        },
        [props.prpOnRowDoubleClick]
    );

    if (!isDynamic && props.prpColumns?.status !== ValueStatus.Available) {
        return <div className="ax-custom-table-loading">{props.prpLoadingText}</div>;
    }

    return (
        <TableContainer
            {...props}
            store={store}
            onSelectionChange={handleSelectionChange}
            onRowClickHandler={handleRowClick}
            onRowDoubleClickHandler={handleRowDoubleClick}
        />
    );
}

export const TableDataSync = observer(TableDataSyncComponent);
