import { CSSProperties, ReactElement } from "react";
import { Segmented } from "antd";
import { FieldValidation, IrisAntdProvider, OptionItem } from "@iris/antd-kit";
import classNames from "classnames";

export interface SegmentedViewProps {
    className?: string;
    style?: CSSProperties;
    options: OptionItem[];
    value?: string;
    disabled: boolean;
    size: "small" | "medium" | "large";
    block: boolean;
    vertical: boolean;
    validation?: string;
    onChange?: (value: string) => void;
}

export function SegmentedView(props: SegmentedViewProps): ReactElement {
    return (
        <IrisAntdProvider>
            <div className={classNames("iris-segmented", props.className)} style={props.style}>
                <Segmented<string>
                    options={props.options}
                    // An empty attribute must show no selection — `undefined` would make antd
                    // fall back to highlighting the first option, which doesn't match the data.
                    value={props.value ?? ""}
                    disabled={props.disabled}
                    size={props.size}
                    block={props.block}
                    orientation={props.vertical ? "vertical" : "horizontal"}
                    onChange={value => props.onChange?.(value)}
                />
                <FieldValidation message={props.validation} />
            </div>
        </IrisAntdProvider>
    );
}
