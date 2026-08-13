import { ChangeEvent, memo } from "react";

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export const SearchBar = memo(({ value, onChange, placeholder = "Search..." }: SearchBarProps) => {
    return (
        <div className="ax-multiselect-search">
            <span className="ax-search-icon">🔍</span>
            <input
                type="text"
                className="ax-search-input"
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {value && (
                <button
                    type="button"
                    className="ax-search-clear"
                    onClick={() => onChange("")}
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
});

SearchBar.displayName = "SearchBar";
