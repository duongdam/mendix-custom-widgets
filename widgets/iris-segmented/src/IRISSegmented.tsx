import { ReactElement, useMemo } from "react";
import { enumOptions, executeAction, isEditable, OptionItem, validationOf } from "@iris/antd-kit";

import { IRISSegmentedContainerProps } from "../typings/IRISSegmentedProps";
import { SegmentedView } from "./components/SegmentedView";

import "./ui/IRISSegmented.css";

export function IRISSegmented(props: IRISSegmentedContainerProps): ReactElement {
    const { attribute, optionsSource, staticOptions } = props;

    const options = useMemo<OptionItem[]>(
        () =>
            optionsSource === "attribute"
                ? enumOptions(attribute)
                : staticOptions.map(option => ({
                      value: option.value,
                      label: option.caption?.value || option.value
                  })),
        [optionsSource, attribute, staticOptions]
    );

    const handleChange = (value: string): void => {
        if (!isEditable(attribute) || value === attribute.value) {
            return;
        }
        attribute.setValue(value);
        executeAction(props.onChangeAction);
    };

    return (
        <SegmentedView
            className={props.class}
            style={props.style}
            options={options}
            value={attribute.value}
            disabled={!isEditable(attribute)}
            size={props.size}
            block={props.block}
            vertical={props.vertical}
            validation={validationOf(attribute)}
            onChange={handleChange}
        />
    );
}
