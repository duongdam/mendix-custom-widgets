import type { ThemeConfig } from "antd";

/**
 * Shared Ant Design theme for every IRIS antd-based widget. Change tokens here, not in
 * individual widgets, so all widgets on a Mendix page stay visually consistent.
 */
export const irisTheme: ThemeConfig = {
    token: {
        colorPrimary: "#1677ff",
        colorSuccess: "#52c41a",
        colorWarning: "#faad14",
        colorError: "#ff4d4f",
        borderRadius: 6,
        // Follow the host page's font (Mendix Atlas) instead of antd's own font stack.
        fontFamily: "inherit",
    },
};
