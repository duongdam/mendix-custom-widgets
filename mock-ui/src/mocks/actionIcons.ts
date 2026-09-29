import type { DynamicValue, WebIcon } from "mendix";

// In Mendix these come from the Icon property (Atlas icon / glyph / image). The mock uses
// inline SVG images, since mock-ui doesn't load Atlas' icon fonts.
function svgIcon(path: string, color = "currentColor"): DynamicValue<WebIcon> {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    return {
        status: "available",
        value: { type: "image", iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` },
    } as DynamicValue<WebIcon>;
}

export const ICONS = {
    download: svgIcon(
        '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
        "#1677ff",
    ),
    retry: svgIcon('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>', "#fa8c16"),
    remove: svgIcon(
        '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>',
        "#ff4d4f",
    ),
    edit: svgIcon(
        '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        "#595959",
    ),
    approve: svgIcon('<path d="M20 6 9 17l-5-5"/>', "#52c41a"),
    reject: svgIcon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', "#ff4d4f"),
};
