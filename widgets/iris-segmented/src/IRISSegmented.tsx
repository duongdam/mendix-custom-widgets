import { ReactElement, useMemo } from "react";
import { enumOptions, executeAction, isEditable, OptionItem, validationOf } from "./utils";

import { IRISSegmentedContainerProps } from "../typings/IRISSegmentedProps";
import { SegmentedView } from "./components/SegmentedView";

import "./ui/IRISSegmented.css";

export function IRISSegmented(props: IRISSegmentedContainerProps): ReactElement {
    const { prpAttribute: attribute, prpOptionsSource: optionsSource, prpStaticOptions: staticOptions } = props;

    const options = useMemo<OptionItem[]>(
        () =>
            optionsSource === "attribute"
                ? enumOptions(attribute)
                : staticOptions.map(option => ({
                      value: option.prpValue,
                      label: option.prpCaption?.value || option.prpValue
                  })),
        [optionsSource, attribute, staticOptions]
    );

    const handleChange = (value: string): void => {
        if (!isEditable(attribute) || value === attribute.value) {
            return;
        }
        attribute.setValue(value);
        executeAction(props.prpOnChange);
    };

    return (
        <SegmentedView
            className={props.class}
            style={props.style}
            options={options}
            value={attribute.value}
            disabled={!isEditable(attribute)}
            size={props.prpSize}
            block={props.prpBlock}
            vertical={props.prpVertical}
            validation={validationOf(attribute)}
            onChange={handleChange}
        />
    );
}
