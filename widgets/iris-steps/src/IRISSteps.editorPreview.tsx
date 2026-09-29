import { ReactElement } from "react";

import { IRISStepsPreviewProps } from "../typings/IRISStepsProps";
import { StepsView } from "./components/StepsView";

import "./ui/IRISSteps.css";

const SAMPLE_ITEMS = ["Step 1", "Step 2", "Step 3"].map(title => ({ key: title, title }));

export function preview(props: IRISStepsPreviewProps): ReactElement {
    const items =
        props.itemsSource === "static" && props.staticItems.length > 0
            ? props.staticItems.map((item, index) => ({
                  key: String(index),
                  title: item.title,
                  description: item.description || undefined
              }))
            : SAMPLE_ITEMS;

    return (
        <StepsView
            className={props.class}
            style={props.styleObject}
            items={items}
            current={0}
            status={props.status}
            type={props.stepsType}
            orientation={props.orientation}
            titlePlacement={props.titlePlacement}
            size={props.size}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISSteps.css");
}
