import { CSSProperties, ReactElement } from "react";
import { Select } from "antd";
import { FieldValidation, IrisAntdProvider, OptionItem } from "@iris/antd-kit";
import classNames from "classnames";

export interface SelectViewProps {
    className?: string;
    style?: CSSProperties;
    tabIndex?: number;
    options: OptionItem[];
    value?: string;
    placeholder?: string;
    showSearch: boolean;
    allowClear: boolean;
    disabled: boolean;
    loading: boolean;
    size: "small" | "medium" | "large";
    variant: "outlined" | "filled" | "borderless" | "underlined";
    validation?: string;
    onChange?: (value: string | undefined) => void;
}

export function SelectView(props: SelectViewProps): ReactElement {
    return (
        <IrisAntdProvider>
            <div className={classNames("iris-select", props.className)} style={props.style}>
                <Select<string, OptionItem>
                    className="iris-select__input"
                    options={props.options}
                    // antd treats `undefined` (not `null`) as "nothing selected" and shows the placeholder.
                    value={props.value || undefined}
                    placeholder={props.placeholder}
                    showSearch={props.showSearch ? { optionFilterProp: "label" } : false}
                    allowClear={props.allowClear}
                    disabled={props.disabled}
                    loading={props.loading}
                    size={props.size}
                    variant={props.variant}
                    status={props.validation ? "error" : undefined}
                    tabIndex={props.tabIndex}
                    onChange={value => props.onChange?.(value ?? undefined)}
                />
                <FieldValidation message={props.validation} />
            </div>
        </IrisAntdProvider>
    );
}
