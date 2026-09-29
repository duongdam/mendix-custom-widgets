import { ReactElement } from "react";

import { IRISSegmentedPreviewProps } from "../typings/IRISSegmentedProps";
import { SegmentedView } from "./components/SegmentedView";

import "./ui/IRISSegmented.css";

const SAMPLE_OPTIONS = ["Option 1", "Option 2", "Option 3"].map(label => ({ value: label, label }));

export function preview(props: IRISSegmentedPreviewProps): ReactElement {
    const options =
        props.optionsSource === "static" && props.staticOptions.length > 0
            ? props.staticOptions.map(option => ({ value: option.value, label: option.caption || option.value }))
            : SAMPLE_OPTIONS;

    return (
        <SegmentedView
            className={props.class}
            style={props.styleObject}
            options={options}
            value={options[0]?.value}
            disabled={props.readOnly}
            size={props.size}
            block={props.block}
            vertical={props.vertical}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISSegmented.css");
}
