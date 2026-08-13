export interface ButtonPreset {
    caption: string;
    variant: "primary" | "secondary";
}

export const BUTTON_PRESETS: ButtonPreset[] = [
    { caption: "Click me", variant: "primary" },
    { caption: "Submit", variant: "primary" },
    { caption: "Save changes", variant: "primary" },
    { caption: "Cancel", variant: "secondary" },
    { caption: "Delete item", variant: "secondary" },
];
