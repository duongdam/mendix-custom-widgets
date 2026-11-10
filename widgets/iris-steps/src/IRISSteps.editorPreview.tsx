import { ReactElement } from "react";

import { IRISStepsPreviewProps } from "../typings/IRISStepsProps";
import { StepsView } from "./components/StepsView";

import "./ui/IRISSteps.css";

const SAMPLE_ITEMS = ["Step 1", "Step 2", "Step 3"].map(title => ({ key: title, title }));

export function preview(props: IRISStepsPreviewProps): ReactElement {
    const items =
        props.prpItemsSource === "static" && props.prpStaticItems.length > 0
            ? props.prpStaticItems.map((item, index) => ({
                  key: String(index),
                  title: item.prpTitle,
                  description: item.prpDescription || undefined
              }))
            : SAMPLE_ITEMS;

    return (
        <StepsView
            className={props.class}
            style={props.styleObject}
            items={items}
            current={0}
            status={"process"}
            type={props.prpStepsType}
            orientation={props.prpOrientation}
            size={props.prpSize}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISSteps.css");
}
