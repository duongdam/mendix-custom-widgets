import { useMemo, useState } from "react";

import { AxCapture } from "../../shared/ax-capture/src/AxCapture";
import type { CaptureFormat } from "../../shared/ax-capture/src/utils/capture";
import { createDynamicValue } from "./mocks/mendixMocks";

const TARGET_NAME = "CaptureDemoCard";

export function AxCaptureDemo() {
    const [fileName, setFileName] = useState("capture-demo");
    const [format, setFormat] = useState<CaptureFormat>("png");
    const [showButton, setShowButton] = useState(true);
    const [cardTitle, setCardTitle] = useState("Doanh số quý 3");

    const buttonCaption = useMemo(() => createDynamicValue("Chụp ảnh"), []);

    return (
        <section>
            <h2>AxCapture</h2>
            <p className="app__hint">
                Captures the card below (found via its <code>mx-name-{TARGET_NAME}</code> class, mirroring how
                Mendix names elements) as a PNG or PDF and auto-downloads it.
            </p>

            <div className="app__controls">
                <label>
                    File name: <input value={fileName} onChange={e => setFileName(e.target.value)} />
                </label>
                <label>
                    Format:{" "}
                    <select value={format} onChange={e => setFormat(e.target.value as CaptureFormat)}>
                        <option value="png">PNG</option>
                        <option value="pdf">PDF</option>
                    </select>
                </label>
                <label>
                    <input type="checkbox" checked={showButton} onChange={e => setShowButton(e.target.checked)} />{" "}
                    Show button
                </label>
                <label>
                    Card title: <input value={cardTitle} onChange={e => setCardTitle(e.target.value)} />
                </label>
            </div>

            <div
                className={`mx-name-${TARGET_NAME}`}
                style={{
                    width: 360,
                    padding: 24,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #1677ff, #722ed1)",
                    color: "#fff",
                    marginBottom: 16,
                }}
            >
                <h3 style={{ margin: 0 }}>{cardTitle}</h3>
                <p style={{ margin: "8px 0 0", opacity: 0.85 }}>Đây là nội dung mẫu sẽ được chụp lại.</p>
            </div>

            {/* Mendix itself wraps every widget instance in a "mx-name-<Name>" container; this demo
                does the same so the "hidden button, triggered externally" scenario below works. */}
            <div className="mx-name-AxCaptureDemo1">
                <AxCapture
                    name="AxCaptureDemo1"
                    class=""
                    targetName={TARGET_NAME}
                    fileName={fileName}
                    format={format}
                    showButton={showButton}
                    buttonCaption={buttonCaption}
                />
            </div>
            {!showButton && (
                <div style={{ marginTop: 8 }}>
                    <p className="app__hint">
                        Button is hidden (still in the DOM) — simulates how an external JS action would trigger it.
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            document
                                .querySelector<HTMLButtonElement>(".mx-name-AxCaptureDemo1 button")
                                ?.click()
                        }
                    >
                        Trigger hidden capture button
                    </button>
                </div>
            )}
        </section>
    );
}
