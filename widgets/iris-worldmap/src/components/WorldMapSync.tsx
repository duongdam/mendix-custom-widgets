import { ReactElement, useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { ValueStatus } from "mendix";

import { IRISWorldMapContainerProps } from "../../typings/IRISWorldMapProps";
import { WorldMapStore } from "../store/WorldMapStore";
import { RegionConnection, Region } from "../types/WorldMapTypes";
import { bigToNumber } from "../utils/bigNumber";
import { normalizeCountryCode } from "../utils/countryCode";
import { WorldMapView, CountryFillConfig } from "./WorldMapView";

export interface WorldMapSyncProps extends IRISWorldMapContainerProps {
    store: WorldMapStore;
}

function WorldMapSyncComponent(props: WorldMapSyncProps): ReactElement | null {
    const { store } = props;

    // --- Regions: Mendix `regions` datasource -> store.regions ---
    const regions = useMemo<Region[]>(() => {
        if (props.regions.status !== ValueStatus.Available || !props.regions.items) {
            return [];
        }
        return props.regions.items
            .map((item): Region | undefined => {
                const id = props.regionIdAttr.get(item)?.value;
                const countryCode = normalizeCountryCode(props.regionCountryCodeAttr.get(item)?.value ?? "");
                const name = props.regionNameAttr.get(item)?.value;
                const latitude = bigToNumber(props.regionLatitudeAttr.get(item)?.value);
                const longitude = bigToNumber(props.regionLongitudeAttr.get(item)?.value);
                if (id === undefined || !countryCode || !name || latitude === undefined || longitude === undefined) {
                    return undefined;
                }
                return {
                    id: String(id),
                    countryCode,
                    name,
                    latitude,
                    longitude,
                    status: props.regionStatusAttr?.get(item)?.value,
                    category: props.regionCategoryAttr?.get(item)?.value,
                    value: bigToNumber(props.regionValueAttr?.get(item)?.value)
                };
            })
            .filter((region): region is Region => region !== undefined);
    }, [
        props.regions,
        props.regionIdAttr,
        props.regionCountryCodeAttr,
        props.regionNameAttr,
        props.regionLatitudeAttr,
        props.regionLongitudeAttr,
        props.regionStatusAttr,
        props.regionCategoryAttr,
        props.regionValueAttr
    ]);

    useEffect(() => {
        if (props.regions.status === ValueStatus.Available) {
            store.setRegions(regions);
        }
    }, [regions, props.regions.status, store]);

    // --- Connections: Mendix `connections` datasource -> store.connections ---
    const connections = useMemo<RegionConnection[]>(() => {
        if (!props.connections || props.connections.status !== ValueStatus.Available || !props.connections.items) {
            return [];
        }
        return props.connections.items
            .map((item): RegionConnection | undefined => {
                const fromCountryCode = normalizeCountryCode(props.connectionFromCodeAttr?.get(item)?.value ?? "");
                const toCountryCode = normalizeCountryCode(props.connectionToCodeAttr?.get(item)?.value ?? "");
                if (!fromCountryCode || !toCountryCode) {
                    return undefined;
                }
                return { fromCountryCode, toCountryCode };
            })
            .filter((connection): connection is RegionConnection => connection !== undefined);
    }, [props.connections, props.connectionFromCodeAttr, props.connectionToCodeAttr]);

    useEffect(() => {
        if (!props.connections || props.connections.status === ValueStatus.Available) {
            store.setConnections(connections);
        }
    }, [connections, props.connections, store]);

    // --- Selection: click -> store + Mendix attribute/action ---
    const handleRegionClick = useCallback(
        (region: Region) => {
            store.setSelectedRegion(region.id);
            props.selectedRegionIdAttribute?.setValue(region.id);
            if (props.onRegionClick?.canExecute) {
                props.onRegionClick.execute({ regionId: region.id, countryCode: region.countryCode });
            }
        },
        [props.selectedRegionIdAttribute, props.onRegionClick, store]
    );

    const fills: CountryFillConfig = {
        default: props.defaultCountryFill,
        stroke: props.countryStroke
    };

    if (props.regions.status !== ValueStatus.Available) {
        return null;
    }

    return (
        <WorldMapView
            className={props.class}
            style={props.style}
            store={store}
            fills={fills}
            markerColor={props.markerColor}
            minMarkerSize={props.minMarkerSize}
            maxMarkerSize={props.maxMarkerSize}
            showLabels={props.showLabels}
            showConnectionLines={props.showConnectionLines}
            connectionLineColor={props.connectionLineColor}
            connectionLineWidth={bigToNumber(props.connectionLineWidth) ?? 1.5}
            enableZoom={props.enableZoom}
            onRegionClick={handleRegionClick}
        />
    );
}

export const WorldMapSync = observer(WorldMapSyncComponent);
