/**
 * This file was generated from IRISWorldMap.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PrpMarkerColorModeEnum = "fixed" | "status" | "category";

export interface IRISWorldMapContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpRegions: ListValue;
    prpRegionIdAttr: ListAttributeValue<string | Big>;
    prpRegionCountryCodeAttr: ListAttributeValue<string>;
    prpRegionNameAttr: ListAttributeValue<string>;
    prpRegionLatitudeAttr: ListAttributeValue<Big>;
    prpRegionLongitudeAttr: ListAttributeValue<Big>;
    prpRegionStatusAttr?: ListAttributeValue<string>;
    prpRegionCategoryAttr?: ListAttributeValue<string>;
    prpRegionValueAttr?: ListAttributeValue<Big>;
    prpConnections?: ListValue;
    prpConnectionFromCodeAttr?: ListAttributeValue<string>;
    prpConnectionToCodeAttr?: ListAttributeValue<string>;
    prpEnableZoom: boolean;
    prpMarkerColorMode: PrpMarkerColorModeEnum;
    prpMarkerColor: string;
    prpMinMarkerSize: number;
    prpMaxMarkerSize: number;
    prpShowLabels: boolean;
    prpSelectedRegionIdAttribute?: EditableValue<string>;
    prpOnRegionClick?: ActionValue<{ regionId: Option<string>; countryCode: Option<string> }>;
}

export interface IRISWorldMapPreviewProps {
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
    prpRegions: {} | { caption: string } | { type: string } | null;
    prpRegionIdAttr: string;
    prpRegionCountryCodeAttr: string;
    prpRegionNameAttr: string;
    prpRegionLatitudeAttr: string;
    prpRegionLongitudeAttr: string;
    prpRegionStatusAttr: string;
    prpRegionCategoryAttr: string;
    prpRegionValueAttr: string;
    prpConnections: {} | { caption: string } | { type: string } | null;
    prpConnectionFromCodeAttr: string;
    prpConnectionToCodeAttr: string;
    prpEnableZoom: boolean;
    prpMarkerColorMode: PrpMarkerColorModeEnum;
    prpMarkerColor: string;
    prpMinMarkerSize: number | null;
    prpMaxMarkerSize: number | null;
    prpShowLabels: boolean;
    prpSelectedRegionIdAttribute: string;
    prpOnRegionClick: {} | null;
}
