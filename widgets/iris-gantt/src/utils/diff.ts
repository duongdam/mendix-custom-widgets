export interface DiffResult<T> {
    added: T[];
    updated: T[];
    removed: string[];
    /** Ids whose structure signature (e.g. parent/order) changed. */
    moved: string[];
}

export interface Snapshot {
    signature: string;
    structure: string;
}

/**
 * Compares the next records against the snapshot of what was last applied.
 * `force` ids are reported as updated even when unchanged — used to snap back optimistic
 * edits the server rejected (the data didn't change, but the chart did).
 */
export function diffRecords<T extends { id: string }>(
    previous: Map<string, Snapshot>,
    next: T[],
    signature: (record: T) => string,
    structure: (record: T) => string,
    force: Set<string>
): { diff: DiffResult<T>; snapshot: Map<string, Snapshot> } {
    const snapshot = new Map<string, Snapshot>();
    const diff: DiffResult<T> = { added: [], updated: [], removed: [], moved: [] };

    for (const record of next) {
        const entry = { signature: signature(record), structure: structure(record) };
        snapshot.set(record.id, entry);
        const before = previous.get(record.id);
        if (!before) {
            diff.added.push(record);
            continue;
        }
        if (before.structure !== entry.structure) {
            diff.moved.push(record.id);
        }
        if (before.signature !== entry.signature || before.structure !== entry.structure || force.has(record.id)) {
            diff.updated.push(record);
        }
    }
    for (const id of previous.keys()) {
        if (!snapshot.has(id)) {
            diff.removed.push(id);
        }
    }
    return { diff, snapshot };
}
