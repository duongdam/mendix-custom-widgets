/**
 * This file was generated from IRISButton.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue } from "mendix";
import { CSSProperties } from "react";

export type VariantEnum = "primary" | "secondary";

export interface IRISButtonContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    caption: DynamicValue<string>;
    variant: VariantEnum;
    onClick?: ActionValue;
}

export interface IRISButtonPreviewProps {
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
    caption: string;
    variant: VariantEnum;
    onClick: {} | null;
}
