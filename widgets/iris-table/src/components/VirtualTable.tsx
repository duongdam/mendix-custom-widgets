import {
    CSSProperties,
    memo,
    MouseEvent,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";

import { ColumnDef, SortDirection, TableRow } from "../types/TableTypes";
import { renderCell } from "../utils/columnMapper";
import { isRowInvalid } from "../utils/parseTableJson";

const CHECKBOX_WIDTH = 48;
const DEFAULT_MIN_WIDTH = 80;
const OVERSCAN = 8;
const HEADER_HEIGHT = 52;
const COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export interface VirtualTableProps {
    columns: ColumnDef[];
    /** Rows to display (already filtered by search). */
    rows: TableRow[];
    /** Every loaded row, used to keep the selection when search hides rows. */
    allRows: TableRow[];
    loading: boolean;
    loadingText: string;
    noDataText: string;
    maxHeight: number;
    rowHeight: number;
    selectable: boolean;
    singleSelect: boolean;
    highlightSelected: boolean;
    striped: boolean;
    highlightOnHover: boolean;
    pointerOnHover: boolean;
    onSelectionChange: (rows: TableRow[]) => void;
    onRowClick: (row: TableRow) => void;
    onRowDoubleClick: (row: TableRow) => void;
}

interface RowData {
    rows: TableRow[];
    columns: ColumnDef[];
    gridTemplate: string;
    selectable: boolean;
    singleSelect: boolean;
    selectedKeys: Set<string>;
    highlightSelected: boolean;
    striped: boolean;
    highlightOnHover: boolean;
    pointerOnHover: boolean;
    onToggle: (row: TableRow) => void;
    onRowClick: (row: TableRow) => void;
    onRowDoubleClick: (row: TableRow) => void;
}

// Number -> px; "120px" -> 120; anything else (%, calc, empty) -> fallback.
export function parsePixelHeight(value: string | undefined, fallback: number): number {
    const match = /^\s*(\d+(?:\.\d+)?)\s*(px)?\s*$/i.exec(value ?? "");
    return match ? Number(match[1]) : fallback;
}

function columnTrack(column: ColumnDef): string {
    if (column.width) {
        return column.width;
    }
    return `minmax(${column.minWidth ?? `${DEFAULT_MIN_WIDTH}px`}, ${column.grow ?? 1}fr)`;
}

function minTrackPx(column: ColumnDef): number {
    const source = column.width ?? column.minWidth;
    const parsed = source ? parseFloat(source) : NaN;
    return Number.isFinite(parsed) && /px$/i.test(source ?? "") ? parsed : DEFAULT_MIN_WIDTH;
}

function cellStyle(column: ColumnDef): CSSProperties {
    return {
        justifyContent: column.align === "right" ? "flex-end" : column.align === "center" ? "center" : "flex-start",
        textAlign: column.align
    };
}

function VirtualRowComponent({ index, style, data }: ListChildComponentProps<RowData>): ReactElement {
    const row = data.rows[index];
    if (!row) {
        return <div style={style} />;
    }
    const invalid = isRowInvalid(row);
    const selected = data.selectedKeys.has(row.key);
    const classes = ["ax-custom-table-vrow"];
    if (selected && data.highlightSelected) {
        classes.push("ax-custom-table-vrow--selected");
    }
    if (data.striped && index % 2 === 1) {
        classes.push("ax-custom-table-vrow--striped");
    }
    if (data.highlightOnHover && !invalid) {
        classes.push("ax-custom-table-vrow--hover");
    }
    if (data.pointerOnHover && !invalid) {
        classes.push("ax-custom-table-vrow--pointer");
    }
    if (invalid) {
        classes.push("ax-custom-table-vrow--invalid");
    }

    const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
        if (invalid) {
            return;
        }
        // Clicks on the checkbox or any inner control (action buttons, links) are theirs alone.
        if (!(event.target as HTMLElement).closest("input, button, a, label, [role=button], .ant-popover")) {
            if (data.selectable) {
                data.onToggle(row);
            }
            data.onRowClick(row);
        }
    };

    return (
        <div
            role="row"
            aria-rowindex={index + 2}
            aria-selected={data.selectable ? selected : undefined}
            className={classes.join(" ")}
            style={{ ...style, gridTemplateColumns: data.gridTemplate }}
            onClick={handleClick}
            onDoubleClick={() => !invalid && data.onRowDoubleClick(row)}
        >
            {data.selectable && (
                <div role="cell" className="ax-custom-table-vcell ax-custom-table-vcell--check">
                    <input
                        type={data.singleSelect ? "radio" : "checkbox"}
                        aria-label={`Select row ${row.key}`}
                        checked={selected}
                        disabled={invalid}
                        onChange={() => data.onToggle(row)}
                    />
                </div>
            )}
            {data.columns.map(column => (
                <div key={column.key} role="cell" className="ax-custom-table-vcell" style={cellStyle(column)}>
                    <span className="ax-custom-table-vcell-text">{renderCell(column, row)}</span>
                </div>
            ))}
        </div>
    );
}

const VirtualRow = memo(VirtualRowComponent);

/**
 * Windowed table for Dynamic mode: only the rows in view are in the DOM (react-window), so
 * tens of thousands of rows scroll smoothly. Rows have a fixed height, so long text is
 * truncated rather than wrapped, and expandable rows are not available.
 */
export function VirtualTable(props: VirtualTableProps): ReactElement {
    const { columns, rows, allRows, selectable, singleSelect, onSelectionChange } = props;

    const [sort, setSort] = useState<{ key: string; direction: SortDirection } | undefined>(undefined);
    const [rawSelectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
    const selectAllRef = useRef<HTMLInputElement>(null);
    const listOuterRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<FixedSizeList<RowData>>(null);
    const [scrollbarWidth, setScrollbarWidth] = useState(0);

    const sortedRows = useMemo(() => {
        const column = sort && columns.find(c => c.key === sort.key);
        if (!sort || !column) {
            return rows;
        }
        const factor = sort.direction === "desc" ? -1 : 1;
        // Decorate once per row instead of converting values inside every comparison.
        const decorated = rows.map(row => {
            const value = row.values[sort.key];
            const text = value == null ? "" : String(value);
            const num = text.trim() === "" ? NaN : Number(text);
            return { row, text, num };
        });
        const allNumeric = decorated.every(item => !Number.isNaN(item.num) || item.text.trim() === "");
        decorated.sort((a, b) =>
            allNumeric
                ? factor * ((Number.isNaN(a.num) ? -Infinity : a.num) - (Number.isNaN(b.num) ? -Infinity : b.num) || 0)
                : factor * COLLATOR.compare(a.text, b.text)
        );
        return decorated.map(item => item.row);
    }, [rows, sort, columns]);

    // Rows that no longer exist (or became invalid) after a data change drop out of the selection.
    const selectedKeys = useMemo(() => {
        if (rawSelectedKeys.size === 0) {
            return rawSelectedKeys;
        }
        const valid = new Set(allRows.filter(row => !isRowInvalid(row)).map(row => row.key));
        const kept = [...rawSelectedKeys].filter(key => valid.has(key));
        return kept.length === rawSelectedKeys.size ? rawSelectedKeys : new Set(kept);
    }, [rawSelectedKeys, allRows]);

    const allRowsRef = useRef(allRows);
    const notifiedCountRef = useRef(0);
    useEffect(() => {
        allRowsRef.current = allRows;
    }, [allRows]);

    const commitSelection = useCallback(
        (next: Set<string>) => {
            setSelectedKeys(next);
            notifiedCountRef.current = next.size;
            onSelectionChange(allRowsRef.current.filter(row => next.has(row.key)));
        },
        [onSelectionChange]
    );

    // A data change that pruned the selection must reach the host too.
    useEffect(() => {
        if (selectedKeys.size !== notifiedCountRef.current) {
            notifiedCountRef.current = selectedKeys.size;
            onSelectionChange(allRowsRef.current.filter(row => selectedKeys.has(row.key)));
        }
        // onSelectionChange is a fresh closure every render; only the selection itself should trigger this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedKeys]);

    const onToggle = useCallback(
        (row: TableRow) => {
            if (isRowInvalid(row)) {
                return;
            }
            const next = new Set(singleSelect ? [] : selectedKeys);
            if (selectedKeys.has(row.key)) {
                next.delete(row.key);
            } else {
                next.add(row.key);
            }
            commitSelection(next);
        },
        [singleSelect, selectedKeys, commitSelection]
    );

    // Select all covers every displayed (filtered) row except invalid ones.
    const selectableDisplayed = useMemo(() => rows.filter(row => !isRowInvalid(row)), [rows]);
    const selectedDisplayedCount = useMemo(
        () => selectableDisplayed.reduce((count, row) => count + (selectedKeys.has(row.key) ? 1 : 0), 0),
        [selectableDisplayed, selectedKeys]
    );
    const allSelected = selectableDisplayed.length > 0 && selectedDisplayedCount === selectableDisplayed.length;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = selectedDisplayedCount > 0 && !allSelected;
        }
    }, [selectedDisplayedCount, allSelected]);

    const onToggleAll = useCallback(() => {
        const next = new Set(selectedKeys);
        if (allSelected) {
            selectableDisplayed.forEach(row => next.delete(row.key));
        } else {
            selectableDisplayed.forEach(row => next.add(row.key));
        }
        commitSelection(next);
    }, [selectedKeys, allSelected, selectableDisplayed, commitSelection]);

    const gridTemplate = useMemo(
        () =>
            [
                selectable ? `${CHECKBOX_WIDTH}px` : undefined,
                ...columns.map(columnTrack),
            ]
                .filter(Boolean)
                .join(" "),
        [columns, selectable]
    );
    const minWidth = useMemo(
        () =>
            (selectable ? CHECKBOX_WIDTH : 0) +
            columns.reduce((sum, column) => sum + minTrackPx(column), 0),
        [columns, selectable]
    );

    const itemData = useMemo<RowData>(
        () => ({
            rows: sortedRows,
            columns,
            gridTemplate,
            selectable,
            singleSelect,
            selectedKeys,
            highlightSelected: props.highlightSelected,
            striped: props.striped,
            highlightOnHover: props.highlightOnHover,
            pointerOnHover: props.pointerOnHover,
            onToggle,
            onRowClick: props.onRowClick,
            onRowDoubleClick: props.onRowDoubleClick
        }),
        // props.* callbacks are passed through as-is; listing the individual props keeps the
        // memo stable between unrelated re-renders of the parent.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            sortedRows,
            columns,
            gridTemplate,
            selectable,
            singleSelect,
            selectedKeys,
            props.highlightSelected,
            props.striped,
            props.highlightOnHover,
            props.pointerOnHover,
            onToggle,
            props.onRowClick,
            props.onRowDoubleClick
        ]
    );

    // A new search or sort starts from the top, so the window never points past the new content.
    useEffect(() => {
        listRef.current?.scrollTo(0);
    }, [rows, sort]);

    const listHeight = Math.min(props.maxHeight, Math.max(sortedRows.length, 1) * props.rowHeight);

    // The list's vertical scrollbar takes width from the rows; give the header the same
    // amount so the columns stay aligned.
    useLayoutEffect(() => {
        const outer = listOuterRef.current;
        if (outer) {
            setScrollbarWidth(outer.offsetWidth - outer.clientWidth);
        }
    }, [listHeight, sortedRows.length]);

    const headerSort = (column: ColumnDef): void => {
        if (!column.sortable) {
            return;
        }
        setSort(current =>
            current?.key !== column.key
                ? { key: column.key, direction: "asc" }
                : current.direction === "asc"
                  ? { key: column.key, direction: "desc" }
                  : undefined
        );
    };

    const showEmpty = !props.loading && sortedRows.length === 0;

    return (
        <div className="ax-custom-table-virtual" role="table" aria-rowcount={sortedRows.length + 1}>
            <div className="ax-custom-table-virtual-scroll-x">
                <div style={{ minWidth }}>
                    <div
                        role="row"
                        className="ax-custom-table-vheader"
                        style={{
                            gridTemplateColumns: gridTemplate,
                            height: HEADER_HEIGHT,
                            paddingRight: scrollbarWidth
                        }}
                    >
                        {selectable && (
                            <div role="columnheader" className="ax-custom-table-vcell ax-custom-table-vcell--check">
                                {!singleSelect && (
                                    <input
                                        ref={selectAllRef}
                                        type="checkbox"
                                        aria-label="Select all rows"
                                        checked={allSelected}
                                        disabled={selectableDisplayed.length === 0}
                                        onChange={onToggleAll}
                                    />
                                )}
                            </div>
                        )}
                        {columns.map(column => {
                            const direction = sort?.key === column.key ? sort.direction : undefined;
                            return (
                                <div
                                    key={column.key}
                                    role="columnheader"
                                    aria-sort={direction ? (direction === "asc" ? "ascending" : "descending") : undefined}
                                    className={`ax-custom-table-vcell ax-custom-table-vcell--head${
                                        column.sortable ? " ax-custom-table-vcell--sortable" : ""
                                    }`}
                                    style={cellStyle(column)}
                                    onClick={() => headerSort(column)}
                                >
                                    {column.sortable && (
                                        <svg
                                            className={`ax-custom-table-sort-icon${
                                                direction ? " ax-custom-table-sort-icon--active" : ""
                                            }${direction === "desc" ? " ax-custom-table-sort-icon--desc" : ""}`}
                                            viewBox="0 0 24 24"
                                            width="18"
                                            height="18"
                                            aria-hidden="true"
                                        >
                                            <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
                                        </svg>
                                    )}
                                    <span className="ax-custom-table-vcell-text">{column.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {props.loading && <div className="ax-custom-table-loading">{props.loadingText}</div>}
                    {showEmpty && <div className="ax-custom-table-loading">{props.noDataText}</div>}
                    {!props.loading && sortedRows.length > 0 && (
                        <FixedSizeList<RowData>
                            ref={listRef}
                            outerRef={listOuterRef}
                            height={listHeight}
                            width="100%"
                            itemCount={sortedRows.length}
                            itemSize={props.rowHeight}
                            itemData={itemData}
                            itemKey={(index, data) => data.rows[index]?.key ?? index}
                            overscanCount={OVERSCAN}
                            style={{ overflowY: "auto" }}
                        >
                            {VirtualRow}
                        </FixedSizeList>
                    )}
                </div>
            </div>
        </div>
    );
}
