import type { ReactElement, ReactNode } from "react";
import { ConfigProvider, theme as antdTheme, type ThemeConfig } from "antd";

import { irisTheme } from "./theme";

export interface IrisAntdProviderProps {
    children: ReactNode;
    /** Per-widget overrides, merged on top of the shared IRIS theme. */
    theme?: ThemeConfig;
    /** Render with antd's dark algorithm. */
    dark?: boolean;
}

/**
 * Root wrapper every IRIS antd widget renders inside. Each Mendix widget is its own React
 * root, so there is no app-level ConfigProvider — this gives every widget the same theme.
 */
export function IrisAntdProvider({ children, theme, dark }: IrisAntdProviderProps): ReactElement {
    return (
        <ConfigProvider
            theme={{
                ...irisTheme,
                ...theme,
                token: { ...irisTheme.token, ...theme?.token },
                components: { ...irisTheme.components, ...theme?.components },
                algorithm: dark ? antdTheme.darkAlgorithm : theme?.algorithm,
            }}
        >
            {children}
        </ConfigProvider>
    );
}
