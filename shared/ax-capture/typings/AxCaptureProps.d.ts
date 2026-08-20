/**
 * This file was generated from AxCapture.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { DynamicValue } from "mendix";
import { CSSProperties } from "react";

export type FormatEnum = "png" | "pdf";

export interface AxCaptureContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    targetName: string;
    fileName: string;
    format: FormatEnum;
    showButton: boolean;
    buttonCaption: DynamicValue<string>;
}

export interface AxCapturePreviewProps {
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
    targetName: string;
    fileName: string;
    format: FormatEnum;
    showButton: boolean;
    buttonCaption: string;
}
