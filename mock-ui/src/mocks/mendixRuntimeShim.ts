/**
 * The real "mendix" npm package is types-only — its actual JS throws if imported,
 * because at real Mendix runtime, Studio Pro substitutes its own implementation for
 * the "mendix" module. Widget source code can legitimately import runtime values from
 * it (e.g. `ValueStatus`), relying on that substitution. Vite has no such substitution,
 * so this file is aliased in place of "mendix" for the browser bundle (see vite.config.ts) —
 * types still resolve to the real package, only the runtime module is swapped.
 */
export const ValueStatus = {
    Available: "available",
    Unavailable: "unavailable",
    Loading: "loading",
} as const;
