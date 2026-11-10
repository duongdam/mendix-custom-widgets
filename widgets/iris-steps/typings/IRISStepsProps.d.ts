/**
 * This file was generated from IRISSteps.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListExpressionValue, ListValue } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type PrpItemsSourceEnum = "static" | "datasource";

export interface PrpStaticItemsType {
    prpTitle: DynamicValue<string>;
    prpDescription?: DynamicValue<string>;
}

export type PrpStepsTypeEnum = "default" | "navigation" | "dot" | "inline" | "panel";

export type PrpOrientationEnum = "horizontal" | "vertical";

export type PrpSizeEnum = "medium" | "small";

export interface PrpStaticItemsPreviewType {
    prpTitle: string;
    prpDescription: string;
}

export interface IRISStepsContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    prpCurrent: EditableValue<Big>;
    prpItemsSource: PrpItemsSourceEnum;
    prpStaticItems: PrpStaticItemsType[];
    prpItemsDatasource?: ListValue;
    prpItemTitle?: ListExpressionValue<string>;
    prpItemDescription?: ListExpressionValue<string>;
    prpClickable: boolean;
    prpErrorWhen?: DynamicValue<boolean>;
    prpStepsType: PrpStepsTypeEnum;
    prpOrientation: PrpOrientationEnum;
    prpSize: PrpSizeEnum;
    prpOnChange?: ActionValue;
}

export interface IRISStepsPreviewProps {
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
    prpCurrent: string;
    prpItemsSource: PrpItemsSourceEnum;
    prpStaticItems: PrpStaticItemsPreviewType[];
    prpItemsDatasource: {} | { caption: string } | { type: string } | null;
    prpItemTitle: string;
    prpItemDescription: string;
    prpClickable: boolean;
    prpErrorWhen: string;
    prpStepsType: PrpStepsTypeEnum;
    prpOrientation: PrpOrientationEnum;
    prpSize: PrpSizeEnum;
    prpOnChange: {} | null;
}
