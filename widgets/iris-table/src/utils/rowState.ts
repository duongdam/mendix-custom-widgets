import { RowState, TableRow } from "../types/TableTypes";

/** State used for rows that have neither a state object nor a Row Values state. */
export const NO_STATE = "none";
const ANY_STATE = "*";

/** "none, Done" -> Set{"none","done"} — states are compared case-insensitively. */
export function parseStateList(csv: string | undefined): Set<string> {
    return new Set(
        (csv ?? "")
            .split(",")
            .map(part => part.trim().toLowerCase())
            .filter(Boolean)
    );
}

export function matchesState(states: Set<string>, state: string): boolean {
    return states.has(ANY_STATE) || states.has(state);
}

/**
 * The effective state of a row: its state object from Row State Items first, then the
 * configured Row Values JSON key, then "none".
 */
export function resolveRowState(
    row: TableRow,
    rowStates: Map<string, RowState>,
    stateJsonKey: string | undefined
): RowState {
    const fromDatasource = rowStates.get(row.key);
    if (fromDatasource) {
        return fromDatasource;
    }
    const fromJson = stateJsonKey ? row.values[stateJsonKey] : undefined;
    if (fromJson !== undefined && fromJson !== null && fromJson !== "") {
        return { state: String(fromJson).toLowerCase() };
    }
    return { state: NO_STATE };
}
