import { ReactElement, useCallback, useRef, useState } from "react";

import { AxCaptureContainerProps } from "../typings/AxCaptureProps";
import { captureElement } from "./utils/capture";

import "./ui/AxCapture.css";

export function AxCapture({
    targetName,
    fileName,
    format,
    showButton,
    buttonCaption
}: AxCaptureContainerProps): ReactElement {
    const [isCapturing, setIsCapturing] = useState(false);
    const capturingRef = useRef(false);

    const handleClick = useCallback(() => {
        if (capturingRef.current) {
            return;
        }
        capturingRef.current = true;
        setIsCapturing(true);

        captureElement(targetName, fileName || "capture", format)
            .catch(error => {
                console.error("AxCapture: capture failed", error);
            })
            .finally(() => {
                capturingRef.current = false;
                setIsCapturing(false);
            });
    }, [targetName, fileName, format]);

    return (
        <button
            type="button"
            className={showButton ? "ax-capture-button" : "ax-capture-button ax-capture-button--hidden"}
            onClick={handleClick}
            disabled={isCapturing}
        >
            {buttonCaption.value ?? "Capture"}
        </button>
    );
}
