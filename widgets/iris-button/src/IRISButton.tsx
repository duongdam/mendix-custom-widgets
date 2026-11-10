import { ReactElement } from "react";
import { IRISButtonContainerProps } from "../typings/IRISButtonProps";

import "./ui/IRISButton.css";

export function IRISButton({ prpCaption, prpVariant, prpOnClick }: IRISButtonContainerProps): ReactElement {
    return (
        <button
            className={`iris-button iris-button--${prpVariant}`}
            onClick={() => prpOnClick?.canExecute && prpOnClick.execute()}
            disabled={prpOnClick != null && !prpOnClick.canExecute}
        >
            {prpCaption.value ?? ""}
        </button>
    );
}
