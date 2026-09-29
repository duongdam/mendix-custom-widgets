import type { DynamicValue, ListExpressionValue, ObjectItem } from "mendix";

export const PRIORITY_KEYS = ["low", "medium", "high", "critical"];
export const PRIORITY_CAPTIONS: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
};

export const COUNTRIES = [
    { code: "VN", name: "Vietnam" },
    { code: "JP", name: "Japan" },
    { code: "SG", name: "Singapore" },
    { code: "US", name: "United States" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "KR", name: "South Korea" },
    { code: "TH", name: "Thailand" },
];

export const WIZARD_STEPS = [
    { title: "Request", description: "Submit the request" },
    { title: "Review", description: "Manager review" },
    { title: "Approve", description: "Finance approval" },
    { title: "Done", description: "Closed" },
];

/** Mock of a text template / expression property linked to a data source. */
export function createListExpressionValue<T>(
    getValue: (item: ObjectItem) => T | undefined,
): ListExpressionValue<string> {
    return {
        get: (item: ObjectItem) =>
            ({ status: "available", value: getValue(item) }) as DynamicValue<string>,
    } as unknown as ListExpressionValue<string>;
}
