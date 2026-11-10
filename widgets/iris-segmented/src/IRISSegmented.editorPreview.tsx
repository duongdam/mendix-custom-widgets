import { ReactElement } from "react";

import { IRISSegmentedPreviewProps } from "../typings/IRISSegmentedProps";
import { SegmentedView } from "./components/SegmentedView";

import "./ui/IRISSegmented.css";

const SAMPLE_OPTIONS = ["Option 1", "Option 2", "Option 3"].map(label => ({ value: label, label }));

export function preview(props: IRISSegmentedPreviewProps): ReactElement {
    const options =
        props.prpOptionsSource === "static" && props.prpStaticOptions.length > 0
            ? props.prpStaticOptions.map(option => ({ value: option.prpValue, label: option.prpCaption || option.prpValue }))
            : SAMPLE_OPTIONS;

    return (
        <SegmentedView
            className={props.class}
            style={props.styleObject}
            options={options}
            value={options[0]?.value}
            disabled={props.readOnly}
            size={props.prpSize}
            block={props.prpBlock}
            vertical={props.prpVertical}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISSegmented.css");
}
