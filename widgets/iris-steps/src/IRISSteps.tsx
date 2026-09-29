import { ReactElement, useMemo } from "react";
import Big from "big.js";
import { bigToNumber, executeAction, isEditable, valueOrUndefined } from "@iris/antd-kit";

import { IRISStepsContainerProps } from "../typings/IRISStepsProps";
import { StepItem, StepsView } from "./components/StepsView";

import "./ui/IRISSteps.css";

function useItems(props: IRISStepsContainerProps): StepItem[] {
    const { itemsSource, staticItems, itemsDatasource, itemTitle, itemDescription } = props;

    return useMemo(() => {
        if (itemsSource === "static") {
            return staticItems.map((item, index) => ({
                key: String(index),
                title: valueOrUndefined(item.title) ?? "",
                description: valueOrUndefined(item.description) || undefined
            }));
        }
        return (itemsDatasource?.items ?? []).map(item => ({
            key: item.id,
            title: itemTitle?.get(item).value ?? "",
            description: itemDescription?.get(item).value || undefined
        }));
    }, [itemsSource, staticItems, itemsDatasource, itemTitle, itemDescription]);
}

export function IRISSteps(props: IRISStepsContainerProps): ReactElement {
    const { current } = props;
    const items = useItems(props);
    const currentIndex = bigToNumber(current.value) ?? 0;
    const status = valueOrUndefined(props.errorWhen) === true ? "error" : props.status;

    const handleChange = (next: number): void => {
        if (next === currentIndex) {
            return;
        }
        current.setValue(new Big(next));
        executeAction(props.onChangeAction);
    };

    return (
        <StepsView
            className={props.class}
            style={props.style}
            items={items}
            current={currentIndex}
            status={status}
            type={props.stepsType}
            orientation={props.orientation}
            titlePlacement={props.titlePlacement}
            size={props.size}
            onChange={props.clickable && isEditable(current) ? handleChange : undefined}
        />
    );
}
