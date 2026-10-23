import { TableRow } from "../types/tableTypes";

export const PARENT_ROW_KEY_FIELD = "ParentRowKey";

export interface TreeRow extends TableRow {
    children?: TreeRow[];
}

function parentKeyOf(row: TableRow): string | undefined {
    const value = row.values[PARENT_ROW_KEY_FIELD];
    return (typeof value === "string" || typeof value === "number") && String(value) !== "" ? String(value) : undefined;
}

// Maps every row to its effective parent key. A parent that is missing from the data, or that would
// make the row its own ancestor, is ignored so the row simply becomes a root.
function effectiveParents(rows: TableRow[]): Map<string, string | undefined> {
    const keys = new Set(rows.map(row => row.key));
    const declared = new Map<string, string | undefined>();
    rows.forEach(row => {
        const parent = parentKeyOf(row);
        declared.set(row.key, parent !== undefined && keys.has(parent) && parent !== row.key ? parent : undefined);
    });
    const effective = new Map<string, string | undefined>();
    declared.forEach((parent, key) => {
        let cursor = parent;
        let steps = 0;
        while (cursor !== undefined && cursor !== key && steps <= rows.length) {
            cursor = declared.get(cursor);
            steps += 1;
        }
        effective.set(key, cursor === key || steps > rows.length ? undefined : parent);
    });
    return effective;
}

export function hasHierarchy(rows: TableRow[]): boolean {
    const parents = effectiveParents(rows);
    return rows.some(row => parents.get(row.key) !== undefined);
}

// Flat rows (children follow the order of the flat list) -> roots with nested `children`.
export function buildTree(rows: TableRow[]): TreeRow[] {
    const parents = effectiveParents(rows);
    const childrenOf = new Map<string, TableRow[]>();
    const roots: TableRow[] = [];
    rows.forEach(row => {
        const parent = parents.get(row.key);
        if (parent === undefined) {
            roots.push(row);
        } else {
            childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), row]);
        }
    });
    const attach = (row: TableRow): TreeRow => {
        const children = childrenOf.get(row.key);
        return children ? { ...row, children: children.map(attach) } : row;
    };
    return roots.map(attach);
}

// Keeps `matched` rows plus every ancestor of them, so a search hit never loses its path.
export function withAncestors(all: TableRow[], matched: TableRow[]): TableRow[] {
    const parents = effectiveParents(all);
    const keep = new Set<string>();
    matched.forEach(row => {
        let cursor: string | undefined = row.key;
        while (cursor !== undefined && !keep.has(cursor)) {
            keep.add(cursor);
            cursor = parents.get(cursor);
        }
    });
    return all.filter(row => keep.has(row.key));
}

export function parentKeys(rows: TableRow[]): string[] {
    const parents = effectiveParents(rows);
    return [...new Set([...parents.values()].filter((key): key is string => key !== undefined))];
}
