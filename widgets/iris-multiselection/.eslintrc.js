const base = require("@mendix/pluggable-widgets-tools/configs/eslint.ts.base.json");

module.exports = {
    ...base,
    overrides: [
        ...(base.overrides || []),
        {
            // Syncs the Mendix datasource/props into local widget state (loading,
            // items, selection) — a real external-system boundary for pluggable
            // widgets, not derivable state that could move out of an effect.
            files: ["src/components/AxNewSelectMain.tsx"],
            rules: {
                "react-hooks/set-state-in-effect": "off",
                // isInternalUpdateRef is only read/written inside effects and event
                // handlers (never during render); the child (ItemRow) only invokes
                // onToggle from its own DOM event handlers too.
                "react-hooks/refs": "off"
            }
        }
    ]
};
