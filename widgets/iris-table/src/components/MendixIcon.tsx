import { ReactElement } from "react";
import { WebIcon } from "mendix";

/** Renders a Mendix `icon` property value (glyph, icon-font class or image). */
export function MendixIcon({ icon }: { icon: WebIcon }): ReactElement | null {
    if (!icon) {
        return null;
    }
    if (icon.type === "image") {
        return <img className="ax-table-action-icon" src={icon.iconUrl} alt="" aria-hidden />;
    }
    const className = icon.type === "glyph" ? `glyphicon ${icon.iconClass}` : icon.iconClass;
    return <span className={`ax-table-action-icon ${className}`} aria-hidden />;
}
