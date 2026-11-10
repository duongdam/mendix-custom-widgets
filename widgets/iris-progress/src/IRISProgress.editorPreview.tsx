import { ReactElement } from "react";

import { IRISProgressPreviewProps } from "../typings/IRISProgressProps";
import { ProgressView } from "./components/ProgressView";

import "./ui/IRISProgress.css";

export function preview(props: IRISProgressPreviewProps): ReactElement {
    return (
        <ProgressView
            className={props.class}
            style={props.styleObject}
            type={props.prpProgressType}
            percent={60}
            successPercent={props.prpSuccessValue ? 30 : undefined}
            status={props.prpStatus === "auto" ? undefined : props.prpStatus}
            showInfo={props.prpShowInfo}
            label={props.prpLabel || undefined}
            lineSize={props.prpLineSize}
            circleSize={props.prpCircleSize ?? 120}
            steps={props.prpSteps ?? 0}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISProgress.css");
}
