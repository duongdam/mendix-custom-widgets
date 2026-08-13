export interface MockItemRecord {
    key: number;
    name: string;
}

/** Sample dataset simulating a Mendix entity list, large enough to exercise virtualization. */
export const MOCK_ITEM_RECORDS: MockItemRecord[] = Array.from({ length: 5000 }, (_, index) => ({
    key: index + 1,
    name: `Item ${String(index + 1).padStart(4, "0")} — ${["Alpha", "Beta", "Gamma", "Delta"][index % 4]}`,
}));

/** Default pre-selected keys (simulates a selectedItems datasource): every 4th item. */
export const DEFAULT_SELECTED_KEYS = MOCK_ITEM_RECORDS.filter((record) => record.key % 4 === 2)
    .map((record) => record.key)
    .join(",");
