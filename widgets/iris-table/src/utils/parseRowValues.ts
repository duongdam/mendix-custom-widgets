export function parseJsonObject(value: string | undefined | null): Record<string, unknown> {
    if (!value) {
        return {};
    }
    try {
        const parsed: unknown = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
}
