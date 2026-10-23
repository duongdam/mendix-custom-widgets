import { useMemo, useState } from "react";
import type { ActionValue, Option } from "mendix";

import { AxNewCustomTable } from "../../widgets/iris-table/src/AxNewCustomTable";
import { createEditableValue } from "./mocks/mendixMocks";
import { generateMockRows, MOCK_COLUMNS } from "./mocks/tableFixtures";

const DATASET_SIZES = [0, 50, 237, 1000, 50000, 500000];

// Same columns/rows as the Datasource demo, expressed as the JSON strings a Dynamic-mode table receives.
const BADGE_COLORS = { active: "green", pending: "orange", suspended: "red", archived: "gray" };

const HEADER_JSON = JSON.stringify(
    MOCK_COLUMNS.map((column) => ({
        header: column.key,
        label: column.label,
        order: column.order,
        width: column.width,
        minWidth: column.minWidth,
        grow: column.grow,
        sortable: column.sortable ?? false,
        hidden: column.visible === false ? true : undefined,
        wrap: column.wrap,
        treeColumn: column.key === "name" ? true : undefined,
        formatType: column.formatType,
        formatPattern: column.formatPattern,
        badgeColors: column.formatType === "badge" ? BADGE_COLORS : undefined,
    })),
);

// Every 9th row is flagged HasInvalid so the disabled-row behaviour can be tried out.
// Rows come in blocks of 7 that form a 3-level tree through ParentRowKey:
//   0 ─┬─ 1 ─┬─ 3        (level 1 -> level 2 -> level 3)
//      │     └─ 4
//      └─ 2 ──── 5
//   6                    (a lone level-1 row)
const TREE_PARENT_OFFSET: Record<number, number | undefined> = { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 };

function buildDataJson(size: number): string {
    const rows = generateMockRows(size);
    return JSON.stringify(
        rows.map((row, index) => {
            const offset = TREE_PARENT_OFFSET[index % 7];
            return {
                RowKey: row.key,
                ParentRowKey:
                    offset === undefined ? undefined : rows[index - (index % 7) + offset]?.key,
                ...row.values,
                HasInvalid: index % 9 === 8,
            };
        }),
    );
}

// Printing hundreds of thousands of keys would make the page itself slow, so long selections are summarised.
function summarizeKeys(keys: Option<string>): string {
    if (!keys) {
        return "(none)";
    }
    const list = keys.split(",");
    return list.length > 20 ? `${list.slice(0, 20).join(",")} … (${list.length.toLocaleString()} rows)` : keys;
}

/** Dynamic mode: all rows are handed over at once as headerJson + dataJson; paging/sort/search are client-side. */
export function AxNewCustomTableDynamicDemo() {
    const [size, setSize] = useState(DATASET_SIZES[2]!);
    const [loading, setLoading] = useState(false);
    const [scrollMode, setScrollMode] = useState<"pages" | "virtual">("virtual");
    const [lastSelection, setLastSelection] = useState("—");
    const [lastDoubleClick, setLastDoubleClick] = useState("—");
    const onRowDoubleClick = useMemo(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: ({ rowKey }: { rowKey: Option<string> }) =>
                    setLastDoubleClick(rowKey ?? "—"),
            }) as unknown as ActionValue<{ rowKey: Option<string> }>,
        [],
    );

    const headerJson = useMemo(() => createEditableValue<string>(HEADER_JSON), []);
    const dataJson = useMemo(() => createEditableValue<string>(buildDataJson(size)), [size]);
    const isLoading = useMemo(() => createEditableValue<boolean>(loading), [loading]);

    const onSelectionChangeAction = useMemo(
        () =>
            ({
                canExecute: true,
                isExecuting: false,
                execute: ({ selectedKeys }: { selectedKeys: Option<string> }) =>
                    setLastSelection(summarizeKeys(selectedKeys)),
            }) as unknown as ActionValue<{ selectedKeys: Option<string> }>,
        [],
    );

    return (
        <section>
            <h2>AxNewCustomTable — Dynamic (JSON)</h2>
            <div className="app__controls">
                <label>
                    Rows{" "}
                    <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                        {DATASET_SIZES.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Scroll mode{" "}
                    <select
                        value={scrollMode}
                        onChange={(e) => setScrollMode(e.target.value as "pages" | "virtual")}
                    >
                        <option value="pages">Pages</option>
                        <option value="virtual">Virtual scroll</option>
                    </select>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={loading}
                        onChange={(e) => setLoading(e.target.checked)}
                    />{" "}
                    isLoading
                </label>
            </div>

            <AxNewCustomTable
                name="ax-new-table-dynamic-preview"
                class=""
                prpDataMode="dynamic"
                prpHeaderJson={headerJson}
                prpDataJson={dataJson}
                prpIsLoading={isLoading}
                prpEnableServerPagination
                prpPaginationMode="pages"
                prpScrollMode={scrollMode}
                prpDefaultPageSize={10}
                prpPageSizeOptions="10,20,50,100"
                prpShowSearch
                prpSearchPlaceholder="Search all fields..."
                prpSearchDebounce={300}
                prpEnableRowSelection
                prpSelectableRowsHighlight
                prpSelectableRowsSingle={false}
                prpOnSelectionChangeAction={onSelectionChangeAction}
                prpOnRowDoubleClick={onRowDoubleClick}
                prpExpandableRows
                prpExpandOnRowClicked={false}
                prpPointerOnHover
                prpStriped
                prpHighlightOnHover
                prpDense={false}
                prpResponsive
                prpFixedHeader
                prpFixedHeaderScrollHeight="420px"
                prpPersistTableHead
                prpNoDataText="No rows match your search"
                prpLoadingText="Loading..."
                prpTotalText="Total {count} items"
                prpLoadMoreText="Load more"
            />

            <p>
                Last selection: <code>{lastSelection}</code> · Last double click:{" "}
                <code>{lastDoubleClick}</code>
            </p>
        </section>
    );
}
