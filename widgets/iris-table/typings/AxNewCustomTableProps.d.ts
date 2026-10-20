/**
 * This file was generated from AxNewCustomTable.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PrpDataModeEnum = "dynamic" | "datasource";

export type PrpScrollModeEnum = "pages" | "virtual";

export type PrpPaginationModeEnum = "pages" | "loadMore";

export interface AxNewCustomTableContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpDataMode: PrpDataModeEnum;
    prpScrollMode: PrpScrollModeEnum;
    prpHeaderJson?: EditableValue<string>;
    prpDataJson?: EditableValue<string>;
    prpIsLoading?: EditableValue<boolean>;
    prpColumns?: ListValue;
    prpColumnKeyAttr?: ListAttributeValue<string>;
    prpColumnLabelAttr?: ListAttributeValue<string>;
    prpColumnWidthAttr?: ListAttributeValue<string>;
    prpColumnSortableAttr?: ListAttributeValue<boolean>;
    prpColumnVisibleAttr?: ListAttributeValue<boolean>;
    prpDataItems?: ListValue;
    prpRowKeyAttr?: ListAttributeValue<string | Big>;
    prpRowValuesAttr?: ListAttributeValue<string>;
    prpEnableServerPagination: boolean;
    prpPaginationMode: PrpPaginationModeEnum;
    prpDefaultPageSize: number;
    prpPageSizeOptions: string;
    prpFetchDataAction?: ActionValue;
    prpOffsetAttribute?: EditableValue<Big>;
    prpLimitAttribute?: EditableValue<Big>;
    prpTotalCountAttribute?: EditableValue<Big>;
    prpShowSearch: boolean;
    prpSearchPlaceholder: string;
    prpSearchDebounce: number;
    prpFilterTextAttribute?: EditableValue<string>;
    prpEnableRowSelection: boolean;
    prpSelectableRowsHighlight: boolean;
    prpSelectableRowsSingle: boolean;
    prpOnSelectionChangeAction?: ActionValue<{ selectedKeys: Option<string> }>;
    prpExpandableRows: boolean;
    prpExpandOnRowClicked: boolean;
    prpPointerOnHover: boolean;
    prpOnRowClick?: ActionValue<{ rowKey: Option<string> }>;
    prpOnRowDoubleClick?: ActionValue<{ rowKey: Option<string> }>;
    prpStriped: boolean;
    prpHighlightOnHover: boolean;
    prpDense: boolean;
    prpResponsive: boolean;
    prpFixedHeader: boolean;
    prpFixedHeaderScrollHeight: string;
    prpPersistTableHead: boolean;
    prpNoDataText: string;
    prpLoadingText: string;
}

export interface AxNewCustomTablePreviewProps {
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
    prpDataMode: PrpDataModeEnum;
    prpScrollMode: PrpScrollModeEnum;
    prpHeaderJson: string;
    prpDataJson: string;
    prpIsLoading: string;
    prpColumns: {} | { caption: string } | { type: string } | null;
    prpColumnKeyAttr: string;
    prpColumnLabelAttr: string;
    prpColumnWidthAttr: string;
    prpColumnSortableAttr: string;
    prpColumnVisibleAttr: string;
    prpDataItems: {} | { caption: string } | { type: string } | null;
    prpRowKeyAttr: string;
    prpRowValuesAttr: string;
    prpEnableServerPagination: boolean;
    prpPaginationMode: PrpPaginationModeEnum;
    prpDefaultPageSize: number | null;
    prpPageSizeOptions: string;
    prpFetchDataAction: {} | null;
    prpOffsetAttribute: string;
    prpLimitAttribute: string;
    prpTotalCountAttribute: string;
    prpShowSearch: boolean;
    prpSearchPlaceholder: string;
    prpSearchDebounce: number | null;
    prpFilterTextAttribute: string;
    prpEnableRowSelection: boolean;
    prpSelectableRowsHighlight: boolean;
    prpSelectableRowsSingle: boolean;
    prpOnSelectionChangeAction: {} | null;
    prpExpandableRows: boolean;
    prpExpandOnRowClicked: boolean;
    prpPointerOnHover: boolean;
    prpOnRowClick: {} | null;
    prpOnRowDoubleClick: {} | null;
    prpStriped: boolean;
    prpHighlightOnHover: boolean;
    prpDense: boolean;
    prpResponsive: boolean;
    prpFixedHeader: boolean;
    prpFixedHeaderScrollHeight: string;
    prpPersistTableHead: boolean;
    prpNoDataText: string;
    prpLoadingText: string;
}
