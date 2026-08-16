import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Big from "big.js";
import type { ActionValue, EditableValue, Option } from "mendix";

import { AxNewTable } from "../../widgets/iris-table/src/AxNewTable";
import { createEditableValue, createListAttributeValue, createListValue } from "./mocks/mendixMocks";
import {
    generateMockRows,
    MOCK_COLUMNS,
    MockColumnRecord,
    MockRowRecord,
    queryMockRows,
    QueryParams,
    QueryResult,
} from "./mocks/tableFixtures";

const DATASET_SIZES = [50, 237, 1000];
const PAGE_SIZES = [10, 20, 50];
const NETWORK_DELAYS = [0, 400, 1500];

interface ServerLogEntry {
    id: number;
    offset: number;
    limit: number;
    sortField?: string;
    sortDirection?: string;
    filterText?: string;
    totalCount: number;
    returned: number;
    delayMs: number;
}

/**
 * Stands in for a Mendix microflow/nanoflow: reads the offset/limit/sort/filter the widget just
 * wrote, "queries" the in-memory dataset after an artificial delay, and hands back one page —
 * exactly what a real "On Fetch Data" microflow does against a database.
 */
export function AxNewTableDemo() {
    const [datasetSize, setDatasetSize] = useState(DATASET_SIZES[1]!);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]!);
    const [networkDelay, setNetworkDelay] = useState(NETWORK_DELAYS[1]!);
    const [paginationMode, setPaginationMode] = useState<"pages" | "loadMore">("pages");
    const [enableSelection, setEnableSelection] = useState(true);
    const [enableExpandable, setEnableExpandable] = useState(true);
    const [showSearch, setShowSearch] = useState(true);

    const dataset = useMemo(() => generateMockRows(datasetSize), [datasetSize]);

    const [pageResult, setPageResult] = useState<QueryResult>(() => queryMockRows(dataset, { offset: 0, limit: pageSize }));
    const [logEntries, setLogEntries] = useState<ServerLogEntry[]>([]);
    const [lastSelection, setLastSelection] = useState("—");
    const [lastSort, setLastSort] = useState("—");
    const [lastRowClick, setLastRowClick] = useState("—");

    const paramsRef = useRef<QueryParams>({ offset: 0, limit: pageSize });
    const requestIdRef = useRef(0);
    const logIdRef = useRef(0);

    // `dataset` (not a ref) in the closure below is intentional: if the dataset changes while a
    // request is in flight, that in-flight request is already superseded — same outcome as the
    // requestId guard, without reading a ref during a later render.
    const runQuery = useCallback(() => {
        const requestId = ++requestIdRef.current;
        const params = { ...paramsRef.current };
        window.setTimeout(() => {
            // A later request may have started (and finished) before this one — drop the stale response.
            if (requestId !== requestIdRef.current) {
                return;
            }
            const result = queryMockRows(dataset, params);
            setPageResult(result);
            setLogEntries(entries =>
                [
                    {
                        id: ++logIdRef.current,
                        offset: params.offset,
                        limit: params.limit,
                        sortField: params.sortField,
                        sortDirection: params.sortDirection,
                        filterText: params.filterText,
                        totalCount: result.totalCount,
                        returned: result.rows.length,
                        delayMs: networkDelay,
                    },
                    ...entries,
                ].slice(0, 8),
            );
        }, networkDelay);
    }, [networkDelay, dataset]);

    // Re-query when the underlying dataset itself changes (dataset-size control), but not on the
    // very first mount — the widget's own initial fetchDataAction call already covers that.
    const isFirstDatasetRender = useRef(true);
    useEffect(() => {
        if (isFirstDatasetRender.current) {
            isFirstDatasetRender.current = false;
            return;
        }
        paramsRef.current.offset = 0;
        runQuery();
    }, [dataset, runQuery]);

    const fetchDataAction = useMemo<ActionValue>(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: () => runQuery(),
            }) as unknown as ActionValue,
        [runQuery],
    );

    // The initial `value` passed to createEditableValue is never read back by anything (only the
    // widget's later `.setValue()` calls, captured via `onChange`, matter) — using fixed
    // constants here avoids reading `paramsRef.current` during render.
    //
    // Every `onChange` below writes to `paramsRef` — react-hooks/refs flags that as "may read a
    // ref during render", but these callbacks are only ever invoked later, from the widget's own
    // effect (via `.setValue()`), never during this component's render.
    const offsetAttribute: EditableValue<Big> = useMemo(
        () =>
            // eslint-disable-next-line react-hooks/refs
            createEditableValue<Big>(new Big(0), next => {
                paramsRef.current.offset = next ? next.toNumber() : 0;
            }),
        [],
    );
    const limitAttribute: EditableValue<Big> = useMemo(
        () =>
            // eslint-disable-next-line react-hooks/refs
            createEditableValue<Big>(new Big(pageSize), next => {
                paramsRef.current.limit = next ? next.toNumber() : pageSize;
            }),
        [pageSize],
    );
    const totalCountAttribute: EditableValue<Big> = useMemo(() => createEditableValue<Big>(new Big(pageResult.totalCount)), [
        pageResult.totalCount,
    ]);
    const sortFieldAttribute: EditableValue<string> = useMemo(
        () =>
            // eslint-disable-next-line react-hooks/refs
            createEditableValue<string>("", next => {
                paramsRef.current.sortField = next || undefined;
                setLastSort(next ? `${next} (pending)` : "—");
            }),
        [],
    );
    const sortDirectionAttribute: EditableValue<string> = useMemo(
        () =>
            // eslint-disable-next-line react-hooks/refs
            createEditableValue<string>("", next => {
                paramsRef.current.sortDirection = (next as "asc" | "desc") || undefined;
            }),
        [],
    );
    const filterTextAttribute: EditableValue<string> = useMemo(
        () =>
            // eslint-disable-next-line react-hooks/refs
            createEditableValue<string>("", next => {
                paramsRef.current.filterText = next || undefined;
            }),
        [],
    );

    const onSortAction: ActionValue<{ sortField: Option<string>; sortDirection: Option<string> }> = useMemo(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: ({ sortField, sortDirection }: { sortField: Option<string>; sortDirection: Option<string> }) =>
                    setLastSort(`${sortField ?? "—"} (${sortDirection ?? "asc"})`),
            }) as unknown as ActionValue<{ sortField: Option<string>; sortDirection: Option<string> }>,
        [],
    );
    const onSelectionChangeAction: ActionValue<{ selectedKeys: Option<string> }> = useMemo(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: ({ selectedKeys }: { selectedKeys: Option<string> }) =>
                    setLastSelection(selectedKeys ? selectedKeys : "(none)"),
            }) as unknown as ActionValue<{ selectedKeys: Option<string> }>,
        [],
    );
    const onRowClick: ActionValue<{ rowKey: Option<string> }> = useMemo(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: ({ rowKey }: { rowKey: Option<string> }) => setLastRowClick(rowKey ?? "—"),
            }) as unknown as ActionValue<{ rowKey: Option<string> }>,
        [],
    );

    const columnsValue = useMemo(() => createListValue(MOCK_COLUMNS), []);
    const columnKeyAttr = useMemo(() => createListAttributeValue("mock.ColumnKey", item => (item as unknown as MockColumnRecord).key), []);
    const columnLabelAttr = useMemo(
        () => createListAttributeValue("mock.ColumnLabel", item => (item as unknown as MockColumnRecord).label),
        [],
    );
    const columnOrderAttr = useMemo(
        () => createListAttributeValue<Big>("mock.ColumnOrder", item => new Big((item as unknown as MockColumnRecord).order)),
        [],
    );
    const columnWidthAttr = useMemo(
        () => createListAttributeValue("mock.ColumnWidth", item => (item as unknown as MockColumnRecord).width as string),
        [],
    );
    const columnMinWidthAttr = useMemo(
        () => createListAttributeValue("mock.ColumnMinWidth", item => (item as unknown as MockColumnRecord).minWidth as string),
        [],
    );
    const columnGrowAttr = useMemo(
        () =>
            createListAttributeValue<Big>("mock.ColumnGrow", item => {
                const grow = (item as unknown as MockColumnRecord).grow;
                return grow === undefined ? undefined : new Big(grow);
            }),
        [],
    );
    const columnSortableAttr = useMemo(
        () => createListAttributeValue("mock.ColumnSortable", item => (item as unknown as MockColumnRecord).sortable as boolean),
        [],
    );
    const columnVisibleAttr = useMemo(
        () => createListAttributeValue("mock.ColumnVisible", item => (item as unknown as MockColumnRecord).visible as boolean),
        [],
    );
    const columnAlignAttr = useMemo(
        () => createListAttributeValue("mock.ColumnAlign", item => (item as unknown as MockColumnRecord).align as string),
        [],
    );
    const columnWrapAttr = useMemo(
        () => createListAttributeValue("mock.ColumnWrap", item => (item as unknown as MockColumnRecord).wrap as boolean),
        [],
    );
    const columnFormatTypeAttr = useMemo(
        () => createListAttributeValue("mock.ColumnFormatType", item => (item as unknown as MockColumnRecord).formatType as string),
        [],
    );
    const columnFormatPatternAttr = useMemo(
        () =>
            createListAttributeValue("mock.ColumnFormatPattern", item => (item as unknown as MockColumnRecord).formatPattern as string),
        [],
    );

    const dataItemsValue = useMemo(() => createListValue(pageResult.rows), [pageResult.rows]);
    const rowKeyAttr = useMemo(
        () => createListAttributeValue<string | Big>("mock.RowKey", item => (item as unknown as MockRowRecord).key),
        [],
    );
    const rowValuesAttr = useMemo(
        () => createListAttributeValue("mock.RowValues", item => JSON.stringify((item as unknown as MockRowRecord).values)),
        [],
    );

    return (
        <section>
            <h2>AxNewTable</h2>
            <div className="app__controls">
                <label>
                    Dataset size{" "}
                    <select value={datasetSize} onChange={e => setDatasetSize(Number(e.target.value))}>
                        {DATASET_SIZES.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Page size{" "}
                    <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                        {PAGE_SIZES.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Pagination mode{" "}
                    <select value={paginationMode} onChange={e => setPaginationMode(e.target.value as "pages" | "loadMore")}>
                        <option value="pages">Pages</option>
                        <option value="loadMore">Load more</option>
                    </select>
                </label>
                <label>
                    Simulated network delay{" "}
                    <select value={networkDelay} onChange={e => setNetworkDelay(Number(e.target.value))}>
                        {NETWORK_DELAYS.map(delay => (
                            <option key={delay} value={delay}>
                                {delay}ms
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <input type="checkbox" checked={enableSelection} onChange={e => setEnableSelection(e.target.checked)} />{" "}
                    Row selection
                </label>
                <label>
                    <input type="checkbox" checked={enableExpandable} onChange={e => setEnableExpandable(e.target.checked)} />{" "}
                    Expandable rows
                </label>
                <label>
                    <input type="checkbox" checked={showSearch} onChange={e => setShowSearch(e.target.checked)} /> Search box
                </label>
            </div>

            <AxNewTable
                key={`${pageSize}-${paginationMode}`}
                name="ax-new-table-preview"
                class=""
                columns={columnsValue}
                columnKeyAttr={columnKeyAttr}
                columnLabelAttr={columnLabelAttr}
                columnOrderAttr={columnOrderAttr}
                columnWidthAttr={columnWidthAttr}
                columnMinWidthAttr={columnMinWidthAttr}
                columnGrowAttr={columnGrowAttr}
                columnSortableAttr={columnSortableAttr}
                columnVisibleAttr={columnVisibleAttr}
                columnAlignAttr={columnAlignAttr}
                columnWrapAttr={columnWrapAttr}
                columnFormatTypeAttr={columnFormatTypeAttr}
                columnFormatPatternAttr={columnFormatPatternAttr}
                dataItems={dataItemsValue}
                rowKeyAttr={rowKeyAttr}
                rowValuesAttr={rowValuesAttr}
                enableServerPagination
                paginationMode={paginationMode}
                defaultPageSize={pageSize}
                pageSizeOptions="10,20,50,100"
                fetchDataAction={fetchDataAction}
                offsetAttribute={offsetAttribute}
                limitAttribute={limitAttribute}
                totalCountAttribute={totalCountAttribute}
                enableServerSort
                defaultSortFieldKey=""
                defaultSortAsc
                sortFieldAttribute={sortFieldAttribute}
                sortDirectionAttribute={sortDirectionAttribute}
                onSortAction={onSortAction}
                showSearch={showSearch}
                searchPlaceholder="Search all fields..."
                searchDebounce={300}
                filterTextAttribute={filterTextAttribute}
                enableRowSelection={enableSelection}
                selectableRowsHighlight
                selectableRowsSingle={false}
                onSelectionChangeAction={onSelectionChangeAction}
                expandableRows={enableExpandable}
                expandOnRowClicked={false}
                pointerOnHover
                onRowClick={onRowClick}
                striped
                highlightOnHover
                dense={false}
                responsive
                fixedHeader
                fixedHeaderScrollHeight="420px"
                persistTableHead
                noDataText="No rows match your search"
                loadingText="Loading from mock server..."
            />

            <p>
                Last sort: <code>{lastSort}</code> · Last selection: <code>{lastSelection}</code> · Last row click:{" "}
                <code>{lastRowClick}</code>
            </p>

            <details open>
                <summary>Simulated microflow activity ({logEntries.length})</summary>
                <table className="app__log-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>offset</th>
                            <th>limit</th>
                            <th>sort</th>
                            <th>filter</th>
                            <th>delay</th>
                            <th>returned / total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logEntries.map(entry => (
                            <tr key={entry.id}>
                                <td>{entry.id}</td>
                                <td>{entry.offset}</td>
                                <td>{entry.limit}</td>
                                <td>{entry.sortField ? `${entry.sortField} ${entry.sortDirection ?? "asc"}` : "—"}</td>
                                <td>{entry.filterText || "—"}</td>
                                <td>{entry.delayMs}ms</td>
                                <td>
                                    {entry.returned} / {entry.totalCount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </section>
    );
}
