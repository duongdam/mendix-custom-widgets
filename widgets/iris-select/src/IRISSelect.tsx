import { ReactElement, useMemo } from "react";
import { enumOptions, executeAction, isEditable, OptionItem, validationOf, valueOrUndefined } from "@iris/antd-kit";

import { IRISSelectContainerProps } from "../typings/IRISSelectProps";
import { SelectView } from "./components/SelectView";

import "./ui/IRISSelect.css";

function useOptions(props: IRISSelectContainerProps): OptionItem[] {
    const { optionsSource, attribute, optionsDatasource, optionValue, optionLabel } = props;

    return useMemo(() => {
        if (optionsSource === "attribute") {
            return enumOptions(attribute);
        }
        if (!optionsDatasource?.items || !optionValue) {
            return [];
        }
        return optionsDatasource.items.flatMap(item => {
            const value = optionValue.get(item).value;
            if (value === undefined || value === "") {
                return [];
            }
            return [{ value, label: optionLabel?.get(item).value || value }];
        });
    }, [optionsSource, attribute, optionsDatasource, optionValue, optionLabel]);
}

export function IRISSelect(props: IRISSelectContainerProps): ReactElement {
    const { attribute } = props;
    const options = useOptions(props);

    const handleChange = (value: string | undefined): void => {
        if (!isEditable(attribute) || value === attribute.value) {
            return;
        }
        attribute.setValue(value);
        executeAction(props.onChangeAction);
    };

    return (
        <SelectView
            className={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            options={options}
            value={attribute.value}
            placeholder={valueOrUndefined(props.placeholder) || undefined}
            showSearch={props.showSearch}
            allowClear={props.allowClear}
            disabled={!isEditable(attribute)}
            loading={
                attribute.status === "loading" ||
                (props.optionsSource === "datasource" && props.optionsDatasource?.status === "loading")
            }
            size={props.size}
            variant={props.variant}
            validation={validationOf(attribute)}
            onChange={handleChange}
        />
    );
}
