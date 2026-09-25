import { ReactElement, useState } from "react";

import { IRISWorldMapContainerProps } from "../typings/IRISWorldMapProps";
import { WorldMapSync } from "./components/WorldMapSync";
import { WorldMapStore } from "./store/WorldMapStore";

import "./styles/IRISWorldMap.css";

export function IRISWorldMap(props: IRISWorldMapContainerProps): ReactElement {
    const [store] = useState(() => new WorldMapStore());

    return <WorldMapSync {...props} store={store} />;
}
