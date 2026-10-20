import { GanttLinkRecord, GanttTaskRecord } from "../types/GanttTypes";

/** "Block, group" -> Set{"block","group"} */
export function parseTypeList(csv: string): Set<string> {
    return new Set(
        csv
            .split(",")
            .map(part => part.trim().toLowerCase())
            .filter(Boolean)
    );
}

type RawTask = Omit<GanttTaskRecord, "depth">;

/**
 * Sorts siblings by Sort Order (stable, so datasource order breaks ties) and fills in each
 * record's depth. DHTMLX shows siblings in array order, so sorting once here is all it needs.
 * Single pass + memoized depth lookup — O(n log n) for the sort, O(n) for the rest.
 */
export function finalizeTasks(raw: RawTask[]): GanttTaskRecord[] {
    const parentOf = new Map<string, string>();
    for (const task of raw) {
        parentOf.set(task.id, task.parent);
    }

    // Memoized walk up the parent chain; the depth cap guards against parent cycles in bad data.
    const depthCache = new Map<string, number>();
    const depthOf = (id: string, guard = 0): number => {
        const cached = depthCache.get(id);
        if (cached !== undefined) {
            return cached;
        }
        const parent = parentOf.get(id);
        const depth = parent && parentOf.has(parent) && guard < 32 ? depthOf(parent, guard + 1) + 1 : 0;
        depthCache.set(id, depth);
        return depth;
    };

    return raw
        .map((task, index) => ({ task, index }))
        .sort((a, b) => a.task.order - b.task.order || a.index - b.index)
        .map(({ task }) => ({
            ...task,
            // A parent id that doesn't exist in the list would make DHTMLX drop the row — show it
            // at top level instead.
            parent: task.parent && parentOf.has(task.parent) ? task.parent : "",
            depth: depthOf(task.id)
        }));
}

const LINK_TYPES: Record<string, string> = { fs: "0", ss: "1", ff: "2", sf: "3" };
const LINK_TYPE_NAMES = ["FS", "SS", "FF", "SF"];

/** "FS"/"SS"/"FF"/"SF" (or already "0"-"3") -> DHTMLX link type. Defaults to finish-to-start. */
export function toDhtmlxLinkType(value: string | undefined): string {
    const normalized = (value ?? "").trim().toLowerCase();
    if (["0", "1", "2", "3"].includes(normalized)) {
        return normalized;
    }
    return LINK_TYPES[normalized] ?? "0";
}

export function toLinkTypeName(dhtmlxType: string | number | undefined): string {
    return LINK_TYPE_NAMES[Number(dhtmlxType)] ?? "FS";
}

/** Cheap change fingerprints used by the diff. */
export function taskSignature(task: GanttTaskRecord): string {
    return [
        task.text,
        task.irisType,
        task.start.getTime(),
        task.end?.getTime() ?? "",
        task.duration ?? "",
        task.progress,
        task.color ?? "",
        task.readonly ? 1 : 0
    ].join("|");
}

/** Parent + position — a change here needs a re-parse, not just an in-place update. */
export function taskStructureSignature(task: GanttTaskRecord): string {
    return `${task.parent}|${task.order}`;
}

export function linkSignature(link: GanttLinkRecord): string {
    return `${link.source}|${link.target}|${link.type}`;
}
