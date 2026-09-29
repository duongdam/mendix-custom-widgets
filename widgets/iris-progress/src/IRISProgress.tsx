import { ReactElement } from "react";
import { bigToNumber, clamp, valueOrUndefined } from "@iris/antd-kit";

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
    const max = bigToNumber(valueOrUndefined(props.maxValue)) ?? DEFAULT_MAX;
    const valueLoading = props.value.status !== "available";
    const percent = toPercent(bigToNumber(valueOrUndefined(props.value)), max) ?? 0;
    const successPercent = toPercent(bigToNumber(valueOrUndefined(props.successValue)), max);

    let status: ProgressViewStatus | undefined = props.status === "auto" ? undefined : props.status;
    if (valueOrUndefined(props.exceptionWhen) === true) {
        status = "exception";
    }

    const label = valueOrUndefined(props.label) || undefined;
    const canClick = props.onClick?.canExecute === true;

    return (
        <ProgressView
            className={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            type={props.progressType}
            percent={percent}
            successPercent={successPercent}
            status={status}
            // Hide "0%" while the value is still loading instead of flashing a wrong number.
            showInfo={props.showInfo && !valueLoading}
            label={label}
            lineSize={props.lineSize}
            circleSize={props.circleSize}
            steps={props.steps}
            strokeColor={valueOrUndefined(props.strokeColor) || undefined}
            railColor={valueOrUndefined(props.railColor) || undefined}
            strokeLinecap={props.strokeLinecap}
            ariaLabel={label ?? `${Math.round(percent)}%`}
            onClick={canClick ? () => props.onClick?.execute() : undefined}
        />
    );
}
