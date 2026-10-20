import { CSSProperties, ReactElement } from "react";

const TONES = ["blue", "green", "red", "orange", "purple", "gray"] as const;
type Tone = (typeof TONES)[number];

// Fallback when a column gives no explicit color for a value: recognise common status words.
const KEYWORD_TONES: Array<[RegExp, Tone]> = [
    [/^(success|succeeded|approved|done|completed?|active|valid|ok|paid|passed|enabled)$/, "green"],
    [/^(error|failed?|rejected|invalid|denied|cancel(l)?ed|overdue|blocked)$/, "red"],
    [/^(pending|warning|waiting|review|in review|draft|on hold)$/, "orange"],
    [/^(processing|in progress|running|new|info|open)$/, "blue"],
    [/^(inactive|disabled|closed|archived|none|unknown)$/, "gray"]
];

function resolveColor(text: string, badgeColors?: Record<string, string>): string | undefined {
    const normalized = text.trim().toLowerCase();
    const configured = badgeColors?.[normalized];
    if (configured) {
        return configured.toLowerCase();
    }
    return KEYWORD_TONES.find(([pattern]) => pattern.test(normalized))?.[1];
}

export function BadgeCell({ text, badgeColors }: { text: string; badgeColors?: Record<string, string> }): ReactElement {
    const color = resolveColor(text, badgeColors);
    if (color && (TONES as readonly string[]).includes(color)) {
        return <span className={`ax-custom-table-badge ax-custom-table-badge--${color}`}>{text}</span>;
    }
    if (color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(color)) {
        // Custom hex: text in the color, background is the same color at ~10% opacity.
        const style: CSSProperties = { color, backgroundColor: `color-mix(in srgb, ${color} 12%, white)` };
        return (
            <span className="ax-custom-table-badge" style={style}>
                {text}
            </span>
        );
    }
    return <span className="ax-custom-table-badge">{text}</span>;
}
