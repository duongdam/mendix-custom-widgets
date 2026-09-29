import { ReactElement } from "react";

import { IRISDatePickerPreviewProps } from "../typings/IRISDatePickerProps";
import { DatePickerView } from "./components/DatePickerView";

import "./ui/IRISDatePicker.css";

export function preview(props: IRISDatePickerPreviewProps): ReactElement {
    return (
        <DatePickerView
            className={props.class}
            style={props.styleObject}
            range={!!props.endAttribute}
            value={null}
            endValue={null}
            picker={props.picker}
            showTime={props.showTime}
            format={props.format}
            showPresets={false}
            placeholder={props.placeholder || (props.startAttribute ? `[${props.startAttribute}]` : undefined)}
            endPlaceholder={props.endPlaceholder || (props.endAttribute ? `[${props.endAttribute}]` : undefined)}
            allowClear={false}
            disabled={props.readOnly}
            size={props.size}
            variant={props.variant}
            fullWidth={props.fullWidth}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISDatePicker.css");
}
