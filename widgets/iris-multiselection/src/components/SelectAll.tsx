import { memo, useRef, useEffect } from "react";

interface SelectAllProps {
    checked: boolean;
    indeterminate: boolean;
    onChange: (checked: boolean) => void;
    totalVisibleCount: number;
}

export const SelectAll = memo(({ checked, indeterminate, onChange, totalVisibleCount }: SelectAllProps) => {
    const checkboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <div className="ax-multiselect-header" onClick={() => onChange(!checked)}>
            <input
                ref={checkboxRef}
                type="checkbox"
                className="ax-checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                onClick={e => e.stopPropagation()}
            />
            <span className="ax-header-label">Select All</span>
            <span className="ax-header-count">{totalVisibleCount} items</span>
        </div>
    );
});

SelectAll.displayName = "SelectAll";
