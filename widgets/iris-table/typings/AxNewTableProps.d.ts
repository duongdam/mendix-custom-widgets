/**
 * This file was generated from AxNewTable.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PaginationModeEnum = "pages" | "loadMore";

export interface AxNewTableContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    columns: ListValue;
    columnKeyAttr: ListAttributeValue<string>;
    columnLabelAttr: ListAttributeValue<string>;
    columnOrderAttr?: ListAttributeValue<Big>;
    columnWidthAttr?: ListAttributeValue<string>;
    columnMinWidthAttr?: ListAttributeValue<string>;
    columnGrowAttr?: ListAttributeValue<Big>;
    columnSortableAttr?: ListAttributeValue<boolean>;
    columnVisibleAttr?: ListAttributeValue<boolean>;
    columnAlignAttr?: ListAttributeValue<string>;
    columnWrapAttr?: ListAttributeValue<boolean>;
    columnFormatTypeAttr?: ListAttributeValue<string>;
    columnFormatPatternAttr?: ListAttributeValue<string>;
    dataItems: ListValue;
    rowKeyAttr: ListAttributeValue<string | Big>;
    rowValuesAttr: ListAttributeValue<string>;
    enableServerPagination: boolean;
    paginationMode: PaginationModeEnum;
    defaultPageSize: number;
    pageSizeOptions: string;
    fetchDataAction?: ActionValue;
    offsetAttribute?: EditableValue<Big>;
    limitAttribute?: EditableValue<Big>;
    totalCountAttribute?: EditableValue<Big>;
    enableServerSort: boolean;
    defaultSortFieldKey: string;
    defaultSortAsc: boolean;
    sortFieldAttribute?: EditableValue<string>;
    sortDirectionAttribute?: EditableValue<string>;
    onSortAction?: ActionValue<{ sortField: Option<string>; sortDirection: Option<string> }>;
    showSearch: boolean;
    searchPlaceholder: string;
    searchDebounce: number;
    filterTextAttribute?: EditableValue<string>;
    enableRowSelection: boolean;
    selectableRowsHighlight: boolean;
    selectableRowsSingle: boolean;
    onSelectionChangeAction?: ActionValue<{ selectedKeys: Option<string> }>;
    expandableRows: boolean;
    expandOnRowClicked: boolean;
    pointerOnHover: boolean;
    onRowClick?: ActionValue<{ rowKey: Option<string> }>;
    striped: boolean;
    highlightOnHover: boolean;
    dense: boolean;
    responsive: boolean;
    fixedHeader: boolean;
    fixedHeaderScrollHeight: string;
    persistTableHead: boolean;
    noDataText: string;
    loadingText: string;
}

export interface AxNewTablePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    columns: {} | { caption: string } | { type: string } | null;
    columnKeyAttr: string;
    columnLabelAttr: string;
    columnOrderAttr: string;
    columnWidthAttr: string;
    columnMinWidthAttr: string;
    columnGrowAttr: string;
    columnSortableAttr: string;
    columnVisibleAttr: string;
    columnAlignAttr: string;
    columnWrapAttr: string;
    columnFormatTypeAttr: string;
    columnFormatPatternAttr: string;
    dataItems: {} | { caption: string } | { type: string } | null;
    rowKeyAttr: string;
    rowValuesAttr: string;
    enableServerPagination: boolean;
    paginationMode: PaginationModeEnum;
    defaultPageSize: number | null;
    pageSizeOptions: string;
    fetchDataAction: {} | null;
    offsetAttribute: string;
    limitAttribute: string;
    totalCountAttribute: string;
    enableServerSort: boolean;
    defaultSortFieldKey: string;
    defaultSortAsc: boolean;
    sortFieldAttribute: string;
    sortDirectionAttribute: string;
    onSortAction: {} | null;
    showSearch: boolean;
    searchPlaceholder: string;
    searchDebounce: number | null;
    filterTextAttribute: string;
    enableRowSelection: boolean;
    selectableRowsHighlight: boolean;
    selectableRowsSingle: boolean;
    onSelectionChangeAction: {} | null;
    expandableRows: boolean;
    expandOnRowClicked: boolean;
    pointerOnHover: boolean;
    onRowClick: {} | null;
    striped: boolean;
    highlightOnHover: boolean;
    dense: boolean;
    responsive: boolean;
    fixedHeader: boolean;
    fixedHeaderScrollHeight: string;
    persistTableHead: boolean;
    noDataText: string;
    loadingText: string;
}
