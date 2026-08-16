import { ReactElement, useState } from "react";

import { AxNewTableContainerProps } from "../typings/AxNewTableProps";
import { AxNewTableSync } from "./components/AxNewTableSync";
import { TableStore } from "./store/TableStore";
import "./styles/AxNewTable.css";

export function AxNewTable(props: AxNewTableContainerProps): ReactElement {
    const [store] = useState(
        () =>
            new TableStore({
                limit: props.defaultPageSize,
                sortField: props.defaultSortFieldKey || undefined,
                sortDirection: props.defaultSortFieldKey ? (props.defaultSortAsc ? "asc" : "desc") : undefined
            })
    );

    return <AxNewTableSync {...props} store={store} />;
}
