import { CSSProperties, ReactElement, useCallback, useMemo } from "react";
import { Select } from "antd";
import classNames from "classnames";

export interface OptionItem {
    value: string;
    label: string;
}

export interface AxNewSelecterMainProps {
    className?: string;
    style?: CSSProperties;
    tabIndex?: number;
    options: OptionItem[];
    multiple: boolean;
    value: string[];
    placeholder?: string;
    showSearch: boolean;
    allowClear: boolean;
    disabled: boolean;
    loading: boolean;
    size: "small" | "medium" | "large";
    onChange?: (value: string[]) => void;
}

const SEARCH_CONFIG = { optionFilterProp: "label" } as const;

export function AxNewSelecterMain(props: AxNewSelecterMainProps): ReactElement {
    const { multiple, value, onChange } = props;

    // antd treats `undefined` (not `null`/`[]`) as "nothing selected" in single mode.
    const antdValue = useMemo(() => (multiple ? value : (value[0] ?? undefined)), [multiple, value]);

    const handleChange = useCallback(
        (next: string | string[] | undefined | null) => {
            if (next === undefined || next === null) {
                onChange?.([]);
            } else {
                onChange?.(Array.isArray(next) ? next : [next]);
            }
        },
        [onChange]
    );

    return (
        <div className={classNames("ax-new-selecter", props.className)} style={props.style}>
            <Select<string | string[], OptionItem>
                className="ax-new-selecter__input"
                mode={multiple ? "multiple" : undefined}
                options={props.options}
                value={antdValue}
                placeholder={props.placeholder}
                showSearch={props.showSearch ? SEARCH_CONFIG : false}
                allowClear={props.allowClear}
                disabled={props.disabled}
                loading={props.loading}
                size={props.size}
                tabIndex={props.tabIndex}
                // Virtualized dropdown + collapsed tags keep 1k–10k+ items/selections responsive.
                virtual
                listHeight={256}
                maxTagCount={multiple ? "responsive" : undefined}
                onChange={handleChange}
            />
        </div>
    );
}
