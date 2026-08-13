export interface MockCardItem {
    id: number;
    label: string;
}

/** Sample dataset simulating a Mendix entity list feeding the card's item count. */
export const MOCK_CARD_ITEMS: MockCardItem[] = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    label: `Task ${index + 1}`,
}));

export const CARD_TITLE_PRESETS = ["My IRIS Card", "Sprint Backlog", "Open Tickets", "Team Tasks"];
