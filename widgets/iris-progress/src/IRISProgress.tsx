import { ReactElement } from "react";
import { bigToNumber, clamp, valueOrUndefined } from "./utils";

import { IRISProgressContainerProps } from "../typings/IRISProgressProps";
import { ProgressView, ProgressViewStatus } from "./components/ProgressView";

import "./ui/IRISProgress.css";

const DEFAULT_MAX = 100;

function toPercent(value: number | undefined, max: number): number | undefined {
    if (value === undefined || !Number.isFinite(value) || max <= 0) {
        return undefined;
    }
    return clamp((value / max) * 100, 0, 100);
}

export function IRISProgress(props: IRISProgressContainerProps): ReactElement {
    const max = bigToNumber(valueOrUndefined(props.prpMaxValue)) ?? DEFAULT_MAX;
    const valueLoading = props.prpValue.status !== "available";
    const percent = toPercent(bigToNumber(valueOrUndefined(props.prpValue)), max) ?? 0;
    const successPercent = toPercent(bigToNumber(valueOrUndefined(props.prpSuccessValue)), max);

    let status: ProgressViewStatus | undefined = props.prpStatus === "auto" ? undefined : props.prpStatus;
    if (valueOrUndefined(props.prpExceptionWhen) === true) {
        status = "exception";
    }

    const label = valueOrUndefined(props.prpLabel) || undefined;
    const canClick = props.prpOnClick?.canExecute === true;

    return (
        <ProgressView
            className={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            type={props.prpProgressType}
            percent={percent}
            successPercent={successPercent}
            status={status}
            // Hide "0%" while the value is still loading instead of flashing a wrong number.
            showInfo={props.prpShowInfo && !valueLoading}
            label={label}
            lineSize={props.prpLineSize}
            circleSize={props.prpCircleSize}
            steps={props.prpSteps}
            strokeColor={valueOrUndefined(props.prpStrokeColor) || undefined}
            ariaLabel={label ?? `${Math.round(percent)}%`}
            onClick={canClick ? () => props.prpOnClick?.execute() : undefined}
        />
    );
}
