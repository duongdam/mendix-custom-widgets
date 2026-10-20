import { ReactElement, useState } from "react";

import { AxNewCustomTableContainerProps } from "../typings/AxNewCustomTableProps";
import { AxNewCustomTableSync } from "./AxNewCustomTableSync";
import { TableStore } from "./store/TableStore";

import "./styles/AxNewCustomTable.css";

export function AxNewCustomTable(props: AxNewCustomTableContainerProps): ReactElement {
    const [store] = useState(() => new TableStore({ limit: props.prpDefaultPageSize }));

    return <AxNewCustomTableSync {...props} store={store} />;
}
