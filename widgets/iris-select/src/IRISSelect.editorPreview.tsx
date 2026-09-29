import { ReactElement } from "react";

import { IRISSelectPreviewProps } from "../typings/IRISSelectProps";
import { SelectView } from "./components/SelectView";

import "./ui/IRISSelect.css";

export function preview(props: IRISSelectPreviewProps): ReactElement {
    return (
        <SelectView
            className={props.class}
            style={props.styleObject}
            options={[]}
            placeholder={props.placeholder || (props.attribute ? `[${props.attribute}]` : "Select...")}
            showSearch={props.showSearch}
            allowClear={false}
            disabled={props.readOnly}
            loading={false}
            size={props.size}
            variant={props.variant}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISSelect.css");
}
