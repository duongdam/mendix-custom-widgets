import { AX_COMMON_VERSION } from "@iris/ax-common";

// import { IRISButtonDemo } from "./IRISButtonDemo";
// import { IRISCardDemo } from "./IRISCardDemo";
import { IRISPanelDemo } from "./IRISPanelDemo";
import { AxMultiSelectDemo } from "./AxMultiSelectDemo";
import { AxNewTableDemo } from "./AxNewTableDemo";

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
            <AxMultiSelectDemo />
            <AxNewTableDemo />
        </main>
    );
}
