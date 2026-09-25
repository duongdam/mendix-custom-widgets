import { fileURLToPath } from "node:url";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Widgets may import runtime values (e.g. ValueStatus) from "mendix", relying on
            // Mendix Client's runtime substitution. See src/mocks/mendixRuntimeShim.ts.
            mendix: fileURLToPath(new URL("./src/mocks/mendixRuntimeShim.ts", import.meta.url)),
        },
        // Widget source lives outside mock-ui's root (sibling packages under widgets/*), each with
        // its own symlinked react/react-dom peer resolution — force dedupe as a safety net against
        // a second React module instance in Vite's dep graph.
        dedupe: ["react", "react-dom"],
    },
    server: {
        fs: {
            allow: [searchForWorkspaceRoot(process.cwd())],
        },
    },
    optimizeDeps: {
        // Force these into the initial dep-scan pass instead of being discovered lazily once
        // AxNewTableDemo's module graph is crawled — a late "cold" discovery pass has been
        // observed to pre-bundle react/react-dom a second time, breaking hooks.
        include: [
            "react",
            "react-dom",
            "react-data-table-component",
            "html2canvas-pro",
            "jspdf/dist/jspdf.umd.min.js",
            "ag-charts-react",
            "ag-charts-enterprise",
        ],
    },
});
