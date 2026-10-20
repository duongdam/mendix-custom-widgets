import { ReactElement, useState } from "react";

import { IRISGanttContainerProps } from "../typings/IRISGanttProps";
import { GanttSync } from "./components/GanttSync";
import { GanttStore } from "./store/GanttStore";

import "./styles/IRISGantt.css";

export function IRISGantt(props: IRISGanttContainerProps): ReactElement {
    const [store] = useState(() => new GanttStore(props.scale));

    return <GanttSync {...props} store={store} />;
}
