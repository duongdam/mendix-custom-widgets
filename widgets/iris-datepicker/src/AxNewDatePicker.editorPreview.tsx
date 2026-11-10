import { ReactElement } from "react";

import { AxNewDatePickerPreviewProps } from "../typings/AxNewDatePickerProps";
import { AxNewDatePickerMain } from "./components/AxNewDatePickerMain";

import "./ui/AxNewDatePicker.css";

export function preview(props: AxNewDatePickerPreviewProps): ReactElement {
    return (
        <AxNewDatePickerMain
            className={props.class}
            style={props.styleObject}
            range={props.prpMode === "range"}
            value={null}
            endValue={null}
            picker={props.prpPicker}
            showTime={props.prpShowTime}
            format={props.prpFormat}
            showPresets={false}
            placeholder={props.prpPlaceholder || undefined}
            endPlaceholder={props.prpEndPlaceholder || undefined}
            allowClear={false}
            disabled={props.readOnly}
            size={props.prpSize}
            fullWidth={props.prpFullWidth}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/AxNewDatePicker.css");
}
