import { ReactElement } from "react";
import { IRISButtonContainerProps } from "../typings/IRISButtonProps";

import "./ui/IRISButton.css";

export function IRISButton({ caption, variant, onClick }: IRISButtonContainerProps): ReactElement {
    return (
        <button
            className={`iris-button iris-button--${variant}`}
            onClick={() => onClick?.canExecute && onClick.execute()}
            disabled={onClick != null && !onClick.canExecute}
        >
            {caption.value ?? ""}
        </button>
    );
}
