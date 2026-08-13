import { ReactElement } from "react";
import { Card, Empty } from "antd";

import { IRISPanelPreviewProps } from "../typings/IRISPanelProps";

import "./ui/IRISPanel.css";

export function preview({ title }: IRISPanelPreviewProps): ReactElement {
    return (
        <Card className="iris-panel" title={title || "IRIS Panel"}>
            <Empty description="Widget scaffold — add your feature here" />
        </Card>
    );
}

export function getPreviewCss(): string {
    return require("./ui/IRISPanel.css");
}
