import { AX_COMMON_VERSION } from "@iris/ax-common";

// import { IRISButtonDemo } from "./IRISButtonDemo";
// import { IRISCardDemo } from "./IRISCardDemo";
import { IRISPanelDemo } from "./IRISPanelDemo";
import { IRISProgressDemo } from "./IRISProgressDemo";
import { IRISSelectDemo } from "./IRISSelectDemo";
import { IRISDatePickerDemo } from "./IRISDatePickerDemo";
import { IRISSegmentedDemo } from "./IRISSegmentedDemo";
import { IRISStepsDemo } from "./IRISStepsDemo";
import { AxMultiSelectDemo } from "./AxMultiSelectDemo";
import { AxNewTableDemo } from "./AxNewTableDemo";
import { AxCaptureDemo } from "./AxCaptureDemo";
import { IRISWorldMapDemo } from "./IRISWorldMapDemo";

import "./App.css";

export function App() {
    return (
        <main className="app">
            <h1>IRIS Widgets — Mock UI</h1>
            <p className="app__hint">
                Renders widgets from <code>widgets/*</code> against mocked Mendix Client APIs, no
                Studio Pro needed. (@iris/ax-common v{AX_COMMON_VERSION})
            </p>

            {/* <IRISButtonDemo /> */}
            {/* <IRISCardDemo /> */}
            <IRISPanelDemo />
            <IRISProgressDemo />
            <IRISSelectDemo />
            <IRISDatePickerDemo />
            <IRISSegmentedDemo />
            <IRISStepsDemo />
            <AxMultiSelectDemo />
            <AxNewTableDemo />
            <AxCaptureDemo />
            <IRISWorldMapDemo />
        </main>
    );
}
