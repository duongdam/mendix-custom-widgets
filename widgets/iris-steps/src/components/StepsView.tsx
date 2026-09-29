import { CSSProperties, ReactElement } from "react";
import { Steps } from "antd";
import { IrisAntdProvider } from "@iris/antd-kit";
import classNames from "classnames";

export interface StepItem {
    key: string;
    title: string;
    description?: string;
}

export type StepStatus = "wait" | "process" | "finish" | "error";

export interface StepsViewProps {
    className?: string;
    style?: CSSProperties;
    items: StepItem[];
    current: number;
    status: StepStatus;
    type: "default" | "navigation" | "dot" | "inline" | "panel";
    orientation: "horizontal" | "vertical";
    titlePlacement: "horizontal" | "vertical";
    size: "medium" | "small";
    /** When set, steps are clickable. */
    onChange?: (current: number) => void;
}

export function StepsView(props: StepsViewProps): ReactElement {
    return (
        <IrisAntdProvider>
            <div className={classNames("iris-steps", props.className)} style={props.style}>
                <Steps
                    items={props.items}
                    current={props.current}
                    status={props.status}
                    type={props.type}
                    orientation={props.orientation}
                    titlePlacement={props.titlePlacement}
                    size={props.size}
                    onChange={props.onChange}
                />
            </div>
        </IrisAntdProvider>
    );
}
