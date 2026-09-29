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

export const SINGLE_PRESETS = (): Array<{ label: string; value: Dayjs }> => [
    { label: "Today", value: dayjs() },
    { label: "Yesterday", value: dayjs().subtract(1, "day") },
    { label: "Start of month", value: dayjs().startOf("month") }
];

export const RANGE_PRESETS = (): Array<{ label: string; value: [Dayjs, Dayjs] }> => [
    { label: "Today", value: [dayjs(), dayjs()] },
    { label: "Last 7 days", value: [dayjs().subtract(6, "day"), dayjs()] },
    { label: "Last 30 days", value: [dayjs().subtract(29, "day"), dayjs()] },
    { label: "This month", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
    {
        label: "Last month",
        value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")]
    }
];
