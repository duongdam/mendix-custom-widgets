import { ReactElement, useMemo } from "react";
import Big from "big.js";
import { bigToNumber, executeAction, isEditable, valueOrUndefined } from "./utils";

import { IRISStepsContainerProps } from "../typings/IRISStepsProps";
import { StepItem, StepsView } from "./components/StepsView";

import "./ui/IRISSteps.css";

function useItems(props: IRISStepsContainerProps): StepItem[] {
    const { prpItemsSource, prpStaticItems, prpItemsDatasource, prpItemTitle, prpItemDescription } = props;

    return useMemo(() => {
        if (prpItemsSource === "static") {
            return prpStaticItems.map((item, index) => ({
                key: String(index),
                title: valueOrUndefined(item.prpTitle) ?? "",
                description: valueOrUndefined(item.prpDescription) || undefined
            }));
        }
        return (prpItemsDatasource?.items ?? []).map(item => ({
            key: item.id,
            title: prpItemTitle?.get(item).value ?? "",
            description: prpItemDescription?.get(item).value || undefined
        }));
    }, [prpItemsSource, prpStaticItems, prpItemsDatasource, prpItemTitle, prpItemDescription]);
}

export function IRISSteps(props: IRISStepsContainerProps): ReactElement {
    const { prpCurrent: current } = props;
    const items = useItems(props);
    const currentIndex = bigToNumber(current.value) ?? 0;
    const status = valueOrUndefined(props.prpErrorWhen) === true ? "error" : "process";

    const handleChange = (next: number): void => {
        if (next === currentIndex) {
            return;
        }
        current.setValue(new Big(next));
        executeAction(props.prpOnChange);
    };

    return (
        <StepsView
            className={props.class}
            style={props.style}
            items={items}
            current={currentIndex}
            status={status}
            type={props.prpStepsType}
            orientation={props.prpOrientation}
            size={props.prpSize}
            onChange={props.prpClickable && isEditable(current) ? handleChange : undefined}
        />
    );
}
