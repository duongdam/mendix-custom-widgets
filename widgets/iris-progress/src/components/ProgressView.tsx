import { CSSProperties, KeyboardEvent, ReactElement } from "react";
import { Progress } from "antd";
import { IrisAntdProvider } from "@iris/antd-kit";
import classNames from "classnames";

export type ProgressViewType = "line" | "circle" | "dashboard";
export type ProgressViewStatus = "normal" | "active" | "success" | "exception";

export interface ProgressViewProps {
    className?: string;
    style?: CSSProperties;
    tabIndex?: number;
    type: ProgressViewType;
    /** 0–100 */
    percent: number;
    /** 0–100 */
    successPercent?: number;
    status?: ProgressViewStatus;
    showInfo: boolean;
    label?: string;
    lineSize: "medium" | "small";
    circleSize: number;
    steps: number;
    strokeColor?: string;
    railColor?: string;
    strokeLinecap: "round" | "square" | "butt";
    ariaLabel?: string;
    onClick?: () => void;
}

export function ProgressView(props: ProgressViewProps): ReactElement {
    const { type, onClick, label } = props;
    const isLine = type === "line";
    // Clickable progress must be keyboard-focusable.
    const defaultTabIndex = onClick ? 0 : undefined;
    const tabIndex = props.tabIndex ?? defaultTabIndex;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <IrisAntdProvider>
            <div
                className={classNames("iris-progress", `iris-progress--${type}`, props.className, {
                    "iris-progress--clickable": !!onClick
                })}
                style={props.style}
                role={onClick ? "button" : undefined}
                tabIndex={tabIndex}
                onClick={onClick}
                onKeyDown={onClick ? handleKeyDown : undefined}
            >
                <Progress
                    type={type}
                    percent={props.percent}
                    success={props.successPercent !== undefined ? { percent: props.successPercent } : undefined}
                    status={props.status}
                    showInfo={props.showInfo}
                    format={label ? () => label : undefined}
                    size={isLine ? props.lineSize : props.circleSize}
                    steps={isLine && props.steps > 0 ? props.steps : undefined}
                    strokeColor={props.strokeColor}
                    railColor={props.railColor}
                    strokeLinecap={props.strokeLinecap}
                    aria-label={props.ariaLabel}
                />
            </div>
        </IrisAntdProvider>
    );
}
