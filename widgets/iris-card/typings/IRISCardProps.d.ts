/**
 * This file was generated from IRISCard.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { EditableValue, ListValue } from "mendix";
import { CSSProperties } from "react";

export interface IRISCardContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpTitle: EditableValue<string>;
    prpItems?: ListValue;
}

export interface IRISCardPreviewProps {
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
    prpTitle: string;
    prpItems: {} | { caption: string } | { type: string } | null;
}
