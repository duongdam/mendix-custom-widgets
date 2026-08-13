import { memo, CSSProperties } from "react";

export interface ItemRowData<T = unknown> {
    items: T[];
    selectedIds: Set<string>;
    getItemKey: (item: T) => string;
    getItemLabel: (item: T) => string;
    onToggle: (id: string) => void;
    selectionType: any;
}

interface ItemRowProps {
    index: number;
    style: CSSProperties;
    data: ItemRowData;
}

export const ItemRow = memo(({ index, style, data }: ItemRowProps) => {
    const item = data.items[index];
    if (!item) {
        return null;
    }

    const id = data.getItemKey(item);
    const label = data.getItemLabel(item);
    const isSelected = data.selectedIds.has(id);
    const inputType = data.selectionType === "single" ? "radio" : "checkbox";
    const onlyView = data.selectionType === "onlyView";

    return (
        <div
            style={style}
            className={`ax-multiselect-row ${isSelected ? "is-selected" : ""}`}
            onClick={() => data.onToggle(id)}
        >
            {!onlyView ? (
                <input
                    type={inputType}
                    className="ax-checkbox"
                    name={data.selectionType === "single" ? "ax-multiselect-single" : undefined}
                    checked={isSelected}
                    onChange={() => data.onToggle(id)}
                    onClick={e => e.stopPropagation()}
                />
            ) : null}
            <span className="ax-row-label" title={label}>
                {label}
            </span>
        </div>
    );
});

ItemRow.displayName = "ItemRow";
