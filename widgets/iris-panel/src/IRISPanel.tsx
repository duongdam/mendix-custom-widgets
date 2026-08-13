import { ReactElement, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Card, Empty } from "antd";
import classNames from "classnames";

import { IRISPanelContainerProps } from "../typings/IRISPanelProps";
import { PanelStore } from "./store/PanelStore";

import "./ui/IRISPanel.css";

function IRISPanelComponent({ class: className, style, title }: IRISPanelContainerProps): ReactElement {
    const [store] = useState(() => new PanelStore());

    return (
        <Card
            className={classNames("iris-panel", className)}
            style={style}
            title={title?.status === "available" ? title.value : "IRIS Panel"}
            extra={
                <Button size="small" onClick={() => store.toggleCollapsed()}>
                    {store.collapsed ? "Expand" : "Collapse"}
                </Button>
            }
        >
            {!store.collapsed && <Empty description="Widget scaffold — add your feature here" />}
        </Card>
    );
}

export const IRISPanel = observer(IRISPanelComponent);
