import dayjs, { Dayjs } from "dayjs";

export type PickerMode = "date" | "week" | "month" | "quarter" | "year";

/** Start of the day/week/month/quarter/year that `date` falls in. */
export function startOfUnit(date: Dayjs, picker: PickerMode): Dayjs {
    switch (picker) {
        case "date":
            return date.startOf("day");
        case "quarter":
            // antd's dayjs setup doesn't load the quarterOfYear plugin, so compute it directly.
            return date.month(Math.floor(date.month() / 3) * 3).startOf("month");
        default:
            return date.startOf(picker);
    }
}

/** End of the day/week/month/quarter/year that `date` falls in. */
export function endOfUnit(date: Dayjs, picker: PickerMode): Dayjs {
    if (picker === "quarter") {
        return startOfUnit(date, "quarter").add(2, "month").endOf("month");
    }
    return date.endOf(picker === "date" ? "day" : picker);
}

export function toDayjs(date: Date | undefined): Dayjs | null {
    return date ? dayjs(date) : null;
}

// Presets are rebuilt on every render so "today" is never stale. Ranges are inclusive of today:
// "Last 7 days" = today-6 … today, "Next 2 weeks" = today … today+13.
export const SINGLE_PRESETS = (): Array<{ label: string; value: Dayjs }> => [
    { label: "Today", value: dayjs() },
    { label: "Start of month", value: dayjs().startOf("month") },
    { label: "End of month", value: dayjs().endOf("month") }
];

export const RANGE_PRESETS = (): Array<{ label: string; value: [Dayjs, Dayjs] }> => {
    const today = dayjs();
    const lastMonth = today.subtract(1, "month");
    return [
        { label: "Last 7 days", value: [today.subtract(6, "day"), today] },
        { label: "Last 30 days", value: [today.subtract(29, "day"), today] },
        { label: "This week", value: [today.startOf("week"), today.endOf("week")] },
        { label: "This month", value: [today.startOf("month"), today.endOf("month")] },
        { label: "Last month", value: [lastMonth.startOf("month"), lastMonth.endOf("month")] },
        { label: "Next 2 weeks", value: [today, today.add(2, "week").subtract(1, "day")] },
        { label: "Next 1 month", value: [today, today.add(1, "month").subtract(1, "day")] }
    ];
};
