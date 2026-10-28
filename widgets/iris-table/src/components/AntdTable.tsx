import {
    createContext,
    Key,
    MouseEvent,
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { observer } from "mobx-react-lite";
import { Checkbox, Radio, Table, TableColumnsType } from "antd";

import { AxNewCustomTableContainerProps } from "../../typings/AxNewCustomTableProps";
import { TableStore } from "../store/TableStore";
import { TableRow } from "../types/tableTypes";
import { toAntdColumns, virtualWidths } from "../utils/columnMapper";
import { isRowInvalid } from "../utils/parseDynamicJson";
import { buildTree, parentKeys, TreeRow } from "../utils/rowTree";

const CHECKBOX_COLUMN_WIDTH = 50;
// Approximate antd row heights, used only to shrink a virtual table that has few rows.
const ROW_HEIGHT = { middle: 55, small: 39 };
const CONTROL_SELECTOR =
    "input, button, a, label, [role=button], .ant-popover, .ant-checkbox-wrapper, .ant-radio-wrapper, .ant-table-row-expand-icon";

// Number -> px; "120px" -> 120; anything else (%, calc, empty) -> fallback.
export function parsePixelHeight(value: string | undefined, fallback: number): number {
    const match = /^\s*(\d+(?:\.\d+)?)\s*(px)?\s*$/i.exec(value ?? "");
    return match ? Number(match[1]) : fallback;
}

export interface AntdTableProps {
    store: TableStore;
    widgetProps: AxNewCustomTableContainerProps;
    /** Rows to display (already filtered by search in dynamic mode). */
    rows: TableRow[];
    /** Datasource mode: paging happens in Mendix. Dynamic mode: everything is paged in the browser. */
    serverSide: boolean;
    /** Windowed rendering — only the rows in view are in the DOM. Disables paging and expandable rows. */
    virtual: boolean;
    /** Rows carry ParentRowKey links: render them as a tree whose rows expand into child rows. */
    tree: boolean;
    paginate: boolean;
    totalRows: number;
    pageSizeOptions: number[];
    loading: boolean;
    onSelectionChange: (rows: TableRow[]) => void;
    onRowClick: (row: TableRow) => void;
    onRowDoubleClick: (row: TableRow) => void;
}

// Row selection is built here instead of with antd's `rowSelection`: antd re-evaluates every row on
// each selection change, which takes about a second at 500,000 rows. Here only the visible cells
// subscribe to the selection through context, so a change costs the same at any size.
interface SelectionContextValue {
    selected: ReadonlySet<string>;
    single: boolean;
    toggle: (row: TableRow) => void;
    header: { checked: boolean; indeterminate: boolean; disabled: boolean };
    toggleAll: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

function SelectCell({ row }: { row: TableRow }): ReactElement | null {
    const selection = useContext(SelectionContext);
    if (!selection) {
        return null;
    }
    const Control = selection.single ? Radio : Checkbox;
    return (
        <Control
            checked={selection.selected.has(row.key)}
            disabled={isRowInvalid(row)}
            aria-label={`Select row ${row.key}`}
            onChange={() => selection.toggle(row)}
        />
    );
}

function SelectAllCheckbox(): ReactElement | null {
    const selection = useContext(SelectionContext);
    if (!selection || selection.single) {
        return null;
    }
    return (
        <Checkbox
            checked={selection.header.checked}
            indeterminate={selection.header.indeterminate}
            disabled={selection.header.disabled}
            aria-label="Select all rows"
            onChange={selection.toggleAll}
        />
    );
}

const SELECT_COLUMN: TableColumnsType<TableRow>[number] = {
    key: "__select",
    width: CHECKBOX_COLUMN_WIDTH,
    align: "center",
    title: <SelectAllCheckbox />,
    render: (_: unknown, row: TableRow) => <SelectCell row={row} />
};

function AntdTableComponent(props: AntdTableProps): ReactElement {
    const { store, widgetProps, rows, serverSide, virtual, tree, onSelectionChange } = props;
    const singleSelect = widgetProps.prpSelectableRowsSingle;
    const dense = widgetProps.prpDense;
    const allRows = store.dataItems;

    // Virtual scrolling needs pixel widths, so measure the container and split the room between columns.
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    useEffect(() => {
        const element = wrapperRef.current;
        if (!virtual || !element) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => setContainerWidth(Math.floor(entry?.contentRect.width ?? 0)));
        observer.observe(element);
        return () => observer.disconnect();
    }, [virtual]);

    // antd's virtual scrollbar ends a thumb drag only on a `mouseup` that reaches `window`. Inside Mendix
    // that event can be swallowed (a page handler stopping propagation, or the button released over
    // another frame), so the drag never ends and the table keeps scrolling with the mouse. Mouse moves
    // do still arrive, so a move with no button pressed while the thumb is "moving" means the release
    // was lost: replay it.
    useEffect(() => {
        if (!virtual) {
            return;
        }
        const releaseLostDrag = (event: globalThis.MouseEvent): void => {
            if (event.buttons === 0 && wrapperRef.current?.querySelector('[class*="scrollbar-thumb-moving"]')) {
                window.dispatchEvent(new globalThis.MouseEvent("mouseup"));
            }
        };
        window.addEventListener("mousemove", releaseLostDrag, { passive: true });
        return () => window.removeEventListener("mousemove", releaseLostDrag);
    }, [virtual]);

    const selectionWidth = widgetProps.prpEnableRowSelection ? CHECKBOX_COLUMN_WIDTH : 0;
    const virtualColumnWidths = useMemo(
        () => (virtual ? virtualWidths(store.columns, containerWidth - selectionWidth) : undefined),
        [virtual, store.columns, containerWidth, selectionWidth]
    );
    const columns = useMemo(() => {
        const dataColumns = toAntdColumns(store.columns, virtualColumnWidths);
        return widgetProps.prpEnableRowSelection ? [SELECT_COLUMN, ...dataColumns] : dataColumns;
    }, [store.columns, virtualColumnWidths, widgetProps.prpEnableRowSelection]);

    // --- Selection: keys are kept here, rows are resolved from every loaded row so the selection
    // survives search hiding rows and (in "Load more" mode) pages being appended.
    const [selected, setSelected] = useState<ReadonlySet<string>>(
        () => new Set(store.selectedRows.map(row => row.key))
    );

    const commitSelection = useCallback(
        (next: ReadonlySet<string>) => {
            setSelected(next);
            onSelectionChange(allRows.filter(row => next.has(row.key)));
        },
        [allRows, onSelectionChange]
    );

    // Rows that no longer exist (or became invalid) after a data change drop out of the selection.
    useEffect(() => {
        if (selected.size === 0) {
            return;
        }
        const valid = new Set(allRows.filter(row => !isRowInvalid(row)).map(row => row.key));
        const kept = [...selected].filter(key => valid.has(key));
        if (kept.length !== selected.size) {
            commitSelection(new Set(kept));
        }
        // Only a data change should prune; selection changes already come from the user.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRows]);

    const toggleRow = useCallback(
        (row: TableRow): void => {
            if (isRowInvalid(row)) {
                return;
            }
            const next = new Set(singleSelect ? [] : selected);
            if (selected.has(row.key)) {
                next.delete(row.key);
            } else {
                next.add(row.key);
            }
            commitSelection(next);
        },
        [singleSelect, selected, commitSelection]
    );

    // Select all covers every displayed (filtered) row except invalid ones, across all pages.
    const selectableRows = useMemo(() => rows.filter(row => !isRowInvalid(row)), [rows]);
    const selectionContext = useMemo<SelectionContextValue>(() => {
        let selectedCount = 0;
        for (const row of selectableRows) {
            if (selected.has(row.key)) {
                selectedCount += 1;
            }
        }
        const checked = selectableRows.length > 0 && selectedCount === selectableRows.length;
        return {
            selected,
            single: singleSelect,
            toggle: toggleRow,
            header: { checked, indeterminate: selectedCount > 0 && !checked, disabled: selectableRows.length === 0 },
            toggleAll: () => {
                const next = new Set(selected);
                selectableRows.forEach(row => (checked ? next.delete(row.key) : next.add(row.key)));
                commitSelection(next);
            }
        };
    }, [selected, singleSelect, toggleRow, selectableRows, commitSelection]);

    // --- Tree: flat rows -> nested rows. Expansion is controlled so a search can open every branch
    // and clearing it closes them again.
    const dataSource = useMemo(() => (tree ? buildTree(rows) : rows), [tree, rows]);
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
    const searching = Boolean(store.filterText?.trim());
    useEffect(() => {
        setExpandedKeys(tree && searching ? parentKeys(rows) : []);
        // Re-evaluated when the displayed rows change (new search text or new data).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, tree]);

    // The expand icon and indentation live in the column flagged `treeColumn` (default: the first one).
    const treeColumnIndex = useMemo(() => {
        const index = store.columns.filter(column => column.visible).findIndex(column => column.treeColumn);
        return Math.max(index, 0);
    }, [store.columns]);

    // --- Paging: server side follows the store; dynamic mode pages locally and starts over
    // whenever the displayed rows change (new search, new data).
    const [localPage, setLocalPage] = useState(1);
    useEffect(() => {
        if (!serverSide) {
            setLocalPage(1);
        }
    }, [rows, serverSide]);

    const pagination =
        props.paginate && !virtual
            ? {
                  current: serverSide ? store.page : localPage,
                  pageSize: store.limit,
                  ...(serverSide ? { total: props.totalRows } : {}),
                  pageSizeOptions: props.pageSizeOptions,
                  showSizeChanger: true,
                  onChange: (page: number, size: number) => {
                      if (size !== store.limit) {
                          store.setLimit(size);
                          setLocalPage(1);
                      } else if (serverSide) {
                          store.setPage(page);
                      } else {
                          setLocalPage(page);
                      }
                  }
              }
            : (false as const);

    // --- Scrolling
    const scroll = useMemo(() => {
        if (virtual) {
            const maxHeight = parsePixelHeight(widgetProps.prpFixedHeaderScrollHeight, 400);
            const rowHeight = dense ? ROW_HEIGHT.small : ROW_HEIGHT.middle;
            return {
                x: (virtualColumnWidths ?? []).reduce((sum, width) => sum + width, 0) + selectionWidth,
                y: tree ? maxHeight : Math.min(maxHeight, Math.max(rows.length, 1) * rowHeight)
            };
        }
        return {
            x: widgetProps.prpResponsive ? ("max-content" as const) : undefined,
            y: widgetProps.prpFixedHeader ? widgetProps.prpFixedHeaderScrollHeight : undefined
        };
    }, [
        virtual,
        tree,
        dense,
        rows.length,
        virtualColumnWidths,
        selectionWidth,
        widgetProps.prpFixedHeaderScrollHeight,
        widgetProps.prpResponsive,
        widgetProps.prpFixedHeader
    ]);

    const rowClassName = (row: TableRow, index: number): string => {
        const invalid = isRowInvalid(row);
        const classes = ["ax-custom-table-row"];
        if (widgetProps.prpStriped && index % 2 === 1) {
            classes.push("ax-custom-table-row--striped");
        }
        if (widgetProps.prpSelectableRowsHighlight && selected.has(row.key)) {
            classes.push("ax-custom-table-row--selected");
        }
        if (invalid) {
            classes.push("ax-custom-table-row--invalid");
        } else if (widgetProps.prpPointerOnHover) {
            classes.push("ax-custom-table-row--pointer");
        }
        return classes.join(" ");
    };

    const containerClass = [
        "ax-custom-table-antd",
        widgetProps.prpHighlightOnHover ? "" : "ax-custom-table-antd--no-hover"
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <SelectionContext.Provider value={selectionContext}>
            <div ref={wrapperRef}>
                <Table<TableRow>
                    className={containerClass}
                    rowKey="key"
                    columns={columns}
                    dataSource={dataSource}
                    size={dense ? "small" : "middle"}
                    virtual={virtual}
                    scroll={scroll}
                    pagination={pagination}
                    loading={{ spinning: props.loading, description: widgetProps.prpLoadingText }}
                    locale={{ emptyText: widgetProps.prpNoDataText }}
                    rowClassName={rowClassName}
                    expandable={
                        tree
                            ? {
                                  expandedRowKeys: expandedKeys,
                                  onExpandedRowsChange: keys => setExpandedKeys([...keys]),
                                  indentSize: 20,
                                  // The selection column (if any) comes first.
                                  expandIconColumnIndex: treeColumnIndex + (widgetProps.prpEnableRowSelection ? 1 : 0)
                              }
                            : undefined
                    }
                    // An invalid row is inert: no selection, click, double click or expand-on-click.
                    onRow={row =>
                        isRowInvalid(row)
                            ? {}
                            : {
                                  onClick: (event: MouseEvent<HTMLElement>) => {
                                      if ((event.target as HTMLElement).closest(CONTROL_SELECTOR)) {
                                          return;
                                      }
                                      if (
                                          tree &&
                                          widgetProps.prpExpandOnRowClicked &&
                                          (row as TreeRow).children?.length
                                      ) {
                                          setExpandedKeys(keys =>
                                              keys.includes(row.key)
                                                  ? keys.filter(key => key !== row.key)
                                                  : [...keys, row.key]
                                          );
                                      }
                                      if (widgetProps.prpEnableRowSelection) {
                                          toggleRow(row);
                                      }
                                      props.onRowClick(row);
                                  },
                                  onDoubleClick: () => props.onRowDoubleClick(row)
                              }
                    }
                />
            </div>
        </SelectionContext.Provider>
    );
}

export const AntdTable = observer(AntdTableComponent);
