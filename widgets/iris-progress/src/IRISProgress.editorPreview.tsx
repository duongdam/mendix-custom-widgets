import { ReactElement } from "react";

import { IRISProgressPreviewProps } from "../typings/IRISProgressProps";
import { ProgressView } from "./components/ProgressView";

import "./ui/IRISProgress.css";

export function preview(props: IRISProgressPreviewProps): ReactElement {
    return (
        <ProgressView
            className={props.class}
            style={props.styleObject}
            type={props.progressType}
            percent={60}
            successPercent={props.successValue ? 30 : undefined}
            status={props.status === "auto" ? undefined : props.status}
            showInfo={props.showInfo}
            label={props.label || undefined}
            lineSize={props.lineSize}
            circleSize={props.circleSize ?? 120}
            steps={props.steps ?? 0}
            strokeLinecap={props.strokeLinecap}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISProgress.css");
}
