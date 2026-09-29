/**
 * This file was generated from IRISSteps.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListExpressionValue, ListValue } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type ItemsSourceEnum = "static" | "datasource";

export interface StaticItemsType {
    title: DynamicValue<string>;
    description?: DynamicValue<string>;
}

export type StatusEnum = "process" | "wait" | "finish" | "error";

export type StepsTypeEnum = "default" | "navigation" | "dot" | "inline" | "panel";

export type OrientationEnum = "horizontal" | "vertical";

export type TitlePlacementEnum = "horizontal" | "vertical";

export type SizeEnum = "medium" | "small";

export interface StaticItemsPreviewType {
    title: string;
    description: string;
}

export interface IRISStepsContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    current: EditableValue<Big>;
    itemsSource: ItemsSourceEnum;
    staticItems: StaticItemsType[];
    itemsDatasource?: ListValue;
    itemTitle?: ListExpressionValue<string>;
    itemDescription?: ListExpressionValue<string>;
    clickable: boolean;
    status: StatusEnum;
    errorWhen?: DynamicValue<boolean>;
    stepsType: StepsTypeEnum;
    orientation: OrientationEnum;
    titlePlacement: TitlePlacementEnum;
    size: SizeEnum;
    onChangeAction?: ActionValue;
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
    current: string;
    itemsSource: ItemsSourceEnum;
    staticItems: StaticItemsPreviewType[];
    itemsDatasource: {} | { caption: string } | { type: string } | null;
    itemTitle: string;
    itemDescription: string;
    clickable: boolean;
    status: StatusEnum;
    errorWhen: string;
    stepsType: StepsTypeEnum;
    orientation: OrientationEnum;
    titlePlacement: TitlePlacementEnum;
    size: SizeEnum;
    onChangeAction: {} | null;
}
