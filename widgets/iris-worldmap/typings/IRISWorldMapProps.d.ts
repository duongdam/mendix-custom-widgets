/**
 * This file was generated from IRISWorldMap.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue, ListAttributeValue, ListValue, Option } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export interface IRISWorldMapContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    regions: ListValue;
    regionIdAttr: ListAttributeValue<string | Big>;
    regionCountryCodeAttr: ListAttributeValue<string>;
    regionNameAttr: ListAttributeValue<string>;
    regionLatitudeAttr: ListAttributeValue<Big>;
    regionLongitudeAttr: ListAttributeValue<Big>;
    regionStatusAttr?: ListAttributeValue<string>;
    regionCategoryAttr?: ListAttributeValue<string>;
    regionValueAttr?: ListAttributeValue<Big>;
    connections?: ListValue;
    connectionFromCodeAttr?: ListAttributeValue<string>;
    connectionToCodeAttr?: ListAttributeValue<string>;
    enableZoom: boolean;
    defaultCountryFill: string;
    countryStroke: string;
    markerColor: string;
    minMarkerSize: number;
    maxMarkerSize: number;
    showLabels: boolean;
    showConnectionLines: boolean;
    connectionLineColor: string;
    connectionLineWidth: Big;
    selectedRegionIdAttribute?: EditableValue<string>;
    onRegionClick?: ActionValue<{ regionId: Option<string>; countryCode: Option<string> }>;
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
    regions: {} | { caption: string } | { type: string } | null;
    regionIdAttr: string;
    regionCountryCodeAttr: string;
    regionNameAttr: string;
    regionLatitudeAttr: string;
    regionLongitudeAttr: string;
    regionStatusAttr: string;
    regionCategoryAttr: string;
    regionValueAttr: string;
    connections: {} | { caption: string } | { type: string } | null;
    connectionFromCodeAttr: string;
    connectionToCodeAttr: string;
    enableZoom: boolean;
    defaultCountryFill: string;
    countryStroke: string;
    markerColor: string;
    minMarkerSize: number | null;
    maxMarkerSize: number | null;
    showLabels: boolean;
    showConnectionLines: boolean;
    connectionLineColor: string;
    connectionLineWidth: number | null;
    selectedRegionIdAttribute: string;
    onRegionClick: {} | null;
}
