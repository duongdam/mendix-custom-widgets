import { useState, type ComponentType } from "react";
import { Layout, Menu } from "antd";
import { AX_COMMON_VERSION } from "@iris/ax-common";

// import { IRISButtonDemo } from "./IRISButtonDemo";
// import { IRISCardDemo } from "./IRISCardDemo";
import { IRISPanelDemo } from "./IRISPanelDemo";
import { IRISProgressDemo } from "./IRISProgressDemo";
import { AxNewDatePickerDemo } from "./AxNewDatePickerDemo";
import { IRISSegmentedDemo } from "./IRISSegmentedDemo";
import { IRISStepsDemo } from "./IRISStepsDemo";
import { AxNewSelecterDemo } from "./AxNewSelecterDemo";
import { AxMultiSelectDemo } from "./AxMultiSelectDemo";
import { AxNewCustomTableDatasourceDemo } from "./AxNewCustomTableDatasourceDemo";
import { AxNewCustomTableDynamicDemo } from "./AxNewCustomTableDynamicDemo";
import { AxCaptureDemo } from "./AxCaptureDemo";
import { IRISWorldMapDemo } from "./IRISWorldMapDemo";
import { IRISGanttDemo } from "./IRISGanttDemo";

import "./App.css";

interface DemoEntry {
    key: string;
    label: string;
    component: ComponentType;
}

const DEMOS: [DemoEntry, ...DemoEntry[]] = [
    // { key: "button", label: "IRISButton", component: IRISButtonDemo },
    // { key: "card", label: "IRISCard", component: IRISCardDemo },
    { key: "gantt", label: "IRISGantt", component: IRISGanttDemo },
    { key: "panel", label: "IRISPanel", component: IRISPanelDemo },
    { key: "progress", label: "IRISProgress", component: IRISProgressDemo },
    { key: "select", label: "AxNewSelecter", component: AxNewSelecterDemo },
    { key: "date-picker", label: "AxNewDatePicker", component: AxNewDatePickerDemo },
    { key: "segmented", label: "IRISSegmented", component: IRISSegmentedDemo },
    { key: "steps", label: "IRISSteps", component: IRISStepsDemo },
    { key: "multi-select", label: "AxMultiSelect", component: AxMultiSelectDemo },
    { key: "new-table", label: "AxNewCustomTable", component: AxNewCustomTableDatasourceDemo },
    { key: "new-table-dynamic", label: "AxNewCustomTable (Dynamic)", component: AxNewCustomTableDynamicDemo },
    { key: "capture", label: "AxCapture", component: AxCaptureDemo },
    { key: "world-map", label: "IRISWorldMap", component: IRISWorldMapDemo },
];

const STORAGE_KEY = "mock-ui:selected-demo";

function readInitialKey(): string {
    const fromHash = window.location.hash.slice(1);
    if (DEMOS.some(d => d.key === fromHash)) {
        return fromHash;
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && DEMOS.some(d => d.key === stored)) {
            return stored;
        }
    } catch {
        // storage unavailable — fall back to the first demo
    }
    return DEMOS[0].key;
}

export function App() {
    const [selectedKey, setSelectedKey] = useState(readInitialKey);
    const selected = DEMOS.find(d => d.key === selectedKey) ?? DEMOS[0];
    const SelectedDemo = selected.component;

    const handleSelect = (key: string) => {
        setSelectedKey(key);
        window.history.replaceState(null, "", `#${key}`);
        try {
            localStorage.setItem(STORAGE_KEY, key);
        } catch {
            // ignore
        }
    };

    return (
        <Layout className="app-layout">
            <Layout.Sider width={220} theme="light" className="app-layout__sider">
                <div className="app-layout__brand">IRIS Widgets</div>
                <Menu
                    mode="inline"
                    selectedKeys={[selected.key]}
                    items={DEMOS.map(d => ({ key: d.key, label: d.label }))}
                    onClick={({ key }) => handleSelect(key)}
                />
            </Layout.Sider>
            <Layout.Content>
                <main className="app">
                    <h1>{selected.label}</h1>
                    <p className="app__hint">
                        Renders widgets from <code>widgets/*</code> against mocked Mendix Client
                        APIs, no Studio Pro needed. (@iris/ax-common v{AX_COMMON_VERSION})
                    </p>
                    {/* key forces a fresh mount so each demo starts from its initial state */}
                    <SelectedDemo key={selected.key} />
                </main>
            </Layout.Content>
        </Layout>
    );
}
