import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import { ValueStatus } from "mendix";
import type { Big } from "big.js";
import { useDebounce } from "../hooks/useDebounce";
import { SearchBar } from "./SearchBar";
import { SelectAll } from "./SelectAll";
import { ItemRow, ItemRowData } from "./ItemRow";
import { AxMultiSelectContainerProps } from "../../typings/AxMultiSelectProps";

interface ItemSelect {
    keyAttribute: string | Big;
    nameAttribute: string;
}

interface WidgetOption {
    prpHeight: number;
    prpItemHeight: number;
    prpPlaceholder: string;
    prpShowSearch: boolean;
    prpTextSearch: string;
    prpType: "multi" | "onlyView";
}

export const AxNewSelectMain = (props: AxMultiSelectContainerProps): ReactElement => {
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 250);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const isInternalUpdateRef = useRef(false);

    const loading = props.items.status !== ValueStatus.Available;

    const itemsList = useMemo<ItemSelect[]>(() => {
        if (props.items.status !== ValueStatus.Available || !props.items.items) {
            return [];
        }
        return props.items.items.map(item => ({
            keyAttribute: props.keyAttribute.get(item)?.value ?? "",
            nameAttribute: props.nameAttribute.get(item)?.value ?? ""
        }));
    }, [props.items, props.keyAttribute, props.nameAttribute]);

    const options = useMemo<WidgetOption | undefined>(() => {
        if (
            props.prpHeight.status !== ValueStatus.Available ||
            props.prpItemHeight.status !== ValueStatus.Available ||
            props.prpPlaceholder?.status !== ValueStatus.Available ||
            props.prpShowSearch?.status !== ValueStatus.Available ||
            props.prpTextSearch?.status !== ValueStatus.Available
        ) {
            return undefined;
        }
        return {
            prpHeight: props.prpHeight.value != null ? Number(props.prpHeight.value) : 360,
            prpItemHeight: props.prpItemHeight.value != null ? Number(props.prpItemHeight.value) : 38,
            prpPlaceholder: props.prpPlaceholder?.value ? props.prpPlaceholder.value : "Search...",
            prpShowSearch: props.prpShowSearch?.value == null ? true : props.prpShowSearch.value,
            prpTextSearch: props.prpTextSearch?.value ? props.prpTextSearch.value : "",
            prpType: props.type === "multi" ? "multi" : "onlyView"
        };
    }, [
        props.prpHeight,
        props.prpItemHeight,
        props.prpPlaceholder,
        props.prpShowSearch,
        props.prpTextSearch,
        props.type
    ]);

    const isMulti = options?.prpType === "multi";
    const onlyView = options?.prpType === "onlyView";

    // Initialize/reset the local search box whenever the widget's default search text changes.
    useEffect(() => {
        if (options?.prpTextSearch !== undefined) {
            setSearchText(options.prpTextSearch);
        }
    }, [options?.prpTextSearch]);

    const getItemKey = useCallback((item: ItemSelect): string => String(item.keyAttribute), []);

    const getItemLabel = useCallback((item: ItemSelect): string => item.nameAttribute, []);

    // Sync selectedIds from the Mendix prpSelectedItems datasource whenever it changes externally
    // (e.g. a microflow updates the underlying attribute). This must run for an empty value too —
    // otherwise clearing the selection upstream would leave the widget showing a stale selection.
    useEffect(() => {
        if (props.prpSelectedItems?.status !== ValueStatus.Available || onlyView) {
            return;
        }
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            return;
        }

        const value = props.prpSelectedItems.value ?? "";
        setSelectedIds(new Set(value ? value.split(",") : []));
    }, [props.prpSelectedItems, onlyView]);

    // Drop any selected ids that no longer exist in the current item list (e.g. after a data reload).
    useEffect(() => {
        const validIds = new Set(itemsList.map(item => getItemKey(item)));

        setSelectedIds(prevSelected => {
            let changed = false;
            const next = new Set<string>();
            prevSelected.forEach(id => {
                if (validIds.has(id)) {
                    next.add(id);
                } else {
                    changed = true;
                }
            });
            return changed ? next : prevSelected;
        });
    }, [itemsList, getItemKey]);

    const filteredItems = useMemo(() => {
        if (!debouncedSearch.trim()) {
            return itemsList;
        }
        const query = debouncedSearch.toLowerCase();
        return itemsList.filter(item => getItemLabel(item).toLowerCase().includes(query));
    }, [itemsList, debouncedSearch, getItemLabel]);

    const onActionChange = useCallback(
        (newSelectedIds: Set<string>) => {
            isInternalUpdateRef.current = true;
            if (props.onChange && props.onChange.canExecute && !props.onChange.isExecuting) {
                props.onChange.execute({ selectedKeys: Array.from(newSelectedIds).join(",") });
            }
        },
        [props.onChange]
    );

    const handleToggle = useCallback(
        (id: string) => {
            if (onlyView) {
                return;
            }

            let next: Set<string>;
            if (isMulti) {
                next = new Set(selectedIds);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
            } else {
                next = selectedIds.has(id) ? new Set<string>() : new Set<string>([id]);
            }

            setSelectedIds(next);
            onActionChange(next);
        },
        [selectedIds, onActionChange, isMulti, onlyView]
    );

    const isAllSelected = useMemo(() => {
        if (!isMulti || !filteredItems.length) {
            return false;
        }
        return filteredItems.every(item => selectedIds.has(getItemKey(item)));
    }, [filteredItems, selectedIds, getItemKey, isMulti]);

    const isIndeterminate = useMemo(() => {
        if (!isMulti || isAllSelected || !filteredItems.length) {
            return false;
        }
        return filteredItems.some(item => selectedIds.has(getItemKey(item)));
    }, [filteredItems, selectedIds, isAllSelected, getItemKey, isMulti]);

    const handleSelectAllChange = useCallback(
        (shouldSelect: boolean) => {
            const next = new Set(selectedIds);
            if (shouldSelect) {
                filteredItems.forEach(item => next.add(getItemKey(item)));
            } else {
                filteredItems.forEach(item => next.delete(getItemKey(item)));
            }

            setSelectedIds(next);
            onActionChange(next);
        },
        [selectedIds, filteredItems, getItemKey, onActionChange]
    );

    const itemData: ItemRowData<ItemSelect> = useMemo(
        () => ({
            items: filteredItems,
            selectedIds,
            getItemKey,
            getItemLabel,
            onToggle: handleToggle,
            selectionType: options?.prpType ?? props.type
        }),
        [filteredItems, selectedIds, getItemKey, getItemLabel, handleToggle, options?.prpType, props.type]
    );

    if (loading || !options) {
        return <div className="ax-multiselect-loading">Loading items...</div>;
    }

    return (
        <div className="ax-multiselect-container">
            {options.prpShowSearch && (
                <SearchBar value={searchText} onChange={setSearchText} placeholder={options.prpPlaceholder} />
            )}

            {isMulti && (
                <SelectAll
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAllChange}
                    totalVisibleCount={filteredItems.length}
                />
            )}

            <div className="ax-multiselect-list-wrapper" style={{ height: options.prpHeight }}>
                {filteredItems.length === 0 ? (
                    <div className="ax-multiselect-empty">No items found</div>
                ) : (
                    <FixedSizeList
                        height={options.prpHeight}
                        itemCount={filteredItems.length}
                        itemSize={options.prpItemHeight}
                        width="100%"
                        itemData={itemData as ItemRowData}
                    >
                        {ItemRow}
                    </FixedSizeList>
                )}
            </div>
        </div>
    );
};
