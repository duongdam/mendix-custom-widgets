import { ReactElement, useState } from "react";

import { AxNewCustomTableContainerProps } from "../typings/AxNewCustomTableProps";
import { TableDataSync } from "./components/TableDataSync";
import { TableStore } from "./store/TableStore";

import "./ui/AxNewCustomTable.css";

export function AxNewCustomTable(props: AxNewCustomTableContainerProps): ReactElement {
    const [store] = useState(() => new TableStore({ limit: props.prpDefaultPageSize }));

    return <TableDataSync {...props} store={store} />;
}
