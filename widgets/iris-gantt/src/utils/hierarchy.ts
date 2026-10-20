/**
 * "block>group>task" -> which parent type each type may sit under ("" = top level).
 * Types not listed are unrestricted.
 */
export function parseHierarchy(value: string): Map<string, string> {
    const levels = value
        .split(">")
        .map(part => part.trim().toLowerCase())
        .filter(Boolean);
    const allowedParent = new Map<string, string>();
    levels.forEach((type, index) => allowedParent.set(type, index === 0 ? "" : levels[index - 1]!));
    return allowedParent;
}

/** Whether a row of `childType` may be dropped under a parent of `parentType` ("" = root). */
export function canDropUnder(hierarchy: Map<string, string>, childType: string, parentType: string): boolean {
    if (hierarchy.size === 0 || !hierarchy.has(childType)) {
        return true;
    }
    return hierarchy.get(childType) === parentType;
}
