import { MouseEvent, ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { Button, Popconfirm, Progress, Tooltip } from "antd";
import { ActionValue, Option, WebIcon } from "mendix";

import { TableStore } from "../store/TableStore";
import { TableRow } from "../types/TableTypes";
import { matchesState, resolveRowState } from "../utils/rowState";
import { MendixIcon } from "./MendixIcon";

export type ActionButtonStyle = "text" | "outlined" | "primary" | "link";

/** One configured action, already reduced to plain values by the container. */
export interface ActionConfig {
    key: string;
    icon: WebIcon;
    caption?: string;
    tooltip?: string;
    buttonStyle: ActionButtonStyle;
    danger: boolean;
    confirmMessage?: string;
    showWhen: Set<string>;
    onClick?: ActionValue<{ rowKey: Option<string>; actionKey: Option<string> }>;
}

export interface ActionCellProps {
    row: TableRow;
    store: TableStore;
    actions: ActionConfig[];
    progressStates: Set<string>;
    errorStates: Set<string>;
    stateJsonKey?: string;
}

const BUTTON_TYPE: Record<ActionButtonStyle, "text" | "default" | "primary" | "link"> = {
    text: "text",
    outlined: "default",
    primary: "primary",
    link: "link"
};

function ActionButton({ action, row }: { action: ActionConfig; row: TableRow }): ReactElement {
    const canExecute = action.onClick?.canExecute === true;
    // Icon-only buttons still need an accessible name.
    const fallbackLabel = action.tooltip ?? action.key;
    const ariaLabel = action.caption ? undefined : fallbackLabel;
    const run = (): void => {
        if (canExecute) {
            action.onClick?.execute({ rowKey: row.key, actionKey: action.key });
        }
    };

    let button = (
        <Button
            size="small"
            type={BUTTON_TYPE[action.buttonStyle]}
            danger={action.danger}
            icon={<MendixIcon icon={action.icon} />}
            disabled={!canExecute}
            aria-label={ariaLabel}
            onClick={action.confirmMessage ? undefined : run}
        >
            {action.caption}
        </Button>
    );

    if (action.confirmMessage) {
        button = (
            <Popconfirm title={action.confirmMessage} onConfirm={run} disabled={!canExecute}>
                {button}
            </Popconfirm>
        );
    }
    return action.tooltip ? <Tooltip title={action.tooltip}>{button}</Tooltip> : button;
}

// Observes only its own row's state, so a progress tick re-renders this cell
// instead of rebuilding the whole column set.
function ActionCellComponent(props: ActionCellProps): ReactElement {
    const { row, store, actions, progressStates, errorStates } = props;
    const rowState = resolveRowState(row, store.rowStates, props.stateJsonKey);

    const inProgress = progressStates.has(rowState.state);
    const inError = errorStates.has(rowState.state);
    const showProgress = inProgress || (inError && rowState.percent !== undefined);
    const visibleActions = actions.filter(action => matchesState(action.showWhen, rowState.state));

    const progress = showProgress && (
        <Progress
            className="ax-table-progress"
            percent={rowState.percent ?? 0}
            status={inError ? "exception" : "active"}
            size="small"
            format={value => `${Math.round(value ?? 0)}%`}
        />
    );

    return (
        // Stops clicks — including those from Popconfirm/Tooltip portals, which bubble through the
        // React tree — from also triggering the table's row click / expand.
        <div
            className="ax-table-actions"
            onClick={(event: MouseEvent) => event.stopPropagation()}
            data-state={rowState.state}
        >
            {progress && rowState.message ? <Tooltip title={rowState.message}>{progress}</Tooltip> : progress}
            {visibleActions.length > 0 && (
                <div className="ax-table-action-buttons">
                    {visibleActions.map(action => (
                        <ActionButton key={action.key} action={action} row={row} />
                    ))}
                </div>
            )}
        </div>
    );
}

export const ActionCell = observer(ActionCellComponent);
