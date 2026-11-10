import { ReactElement } from "react";

import { AxNewSelecterPreviewProps } from "../typings/AxNewSelecterProps";
import { AxNewSelecterMain } from "./components/AxNewSelecterMain";

import "./ui/AxNewSelecter.css";

export function preview(props: AxNewSelecterPreviewProps): ReactElement {
    return (
        <AxNewSelecterMain
            className={props.class}
            style={props.styleObject}
            options={[]}
            multiple={props.prpMode === "multiple"}
            value={[]}
            placeholder={props.prpPlaceholder || "Select..."}
            showSearch={props.prpShowSearch}
            allowClear={false}
            disabled={props.readOnly}
            loading={false}
            size={props.prpSize}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/AxNewSelecter.css");
}
