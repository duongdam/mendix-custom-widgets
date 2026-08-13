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
    },
    server: {
        fs: {
            allow: [searchForWorkspaceRoot(process.cwd())],
        },
    },
});
