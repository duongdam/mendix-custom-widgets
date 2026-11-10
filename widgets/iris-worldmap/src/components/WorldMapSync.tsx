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
        if (props.prpRegions.status !== ValueStatus.Available || !props.prpRegions.items) {
            return [];
        }
        return props.prpRegions.items
            .map((item): Region | undefined => {
                const id = props.prpRegionIdAttr.get(item)?.value;
                const countryCode = normalizeCountryCode(props.prpRegionCountryCodeAttr.get(item)?.value ?? "");
                const name = props.prpRegionNameAttr.get(item)?.value;
                const latitude = bigToNumber(props.prpRegionLatitudeAttr.get(item)?.value);
                const longitude = bigToNumber(props.prpRegionLongitudeAttr.get(item)?.value);
                if (id === undefined || !countryCode || !name || latitude === undefined || longitude === undefined) {
                    return undefined;
                }
                return {
                    id: String(id),
                    countryCode,
                    name,
                    latitude,
                    longitude,
                    status: props.prpRegionStatusAttr?.get(item)?.value,
                    category: props.prpRegionCategoryAttr?.get(item)?.value,
                    value: bigToNumber(props.prpRegionValueAttr?.get(item)?.value)
                };
            })
            .filter((region): region is Region => region !== undefined);
    }, [
        props.prpRegions,
        props.prpRegionIdAttr,
        props.prpRegionCountryCodeAttr,
        props.prpRegionNameAttr,
        props.prpRegionLatitudeAttr,
        props.prpRegionLongitudeAttr,
        props.prpRegionStatusAttr,
        props.prpRegionCategoryAttr,
        props.prpRegionValueAttr
    ]);

    useEffect(() => {
        if (props.prpRegions.status === ValueStatus.Available) {
            store.setRegions(regions);
        }
    }, [regions, props.prpRegions.status, store]);

    // --- Connections: Mendix `connections` datasource -> store.connections ---
    const connections = useMemo<RegionConnection[]>(() => {
        if (!props.prpConnections || props.prpConnections.status !== ValueStatus.Available || !props.prpConnections.items) {
            return [];
        }
        return props.prpConnections.items
            .map((item): RegionConnection | undefined => {
                const fromCountryCode = normalizeCountryCode(props.prpConnectionFromCodeAttr?.get(item)?.value ?? "");
                const toCountryCode = normalizeCountryCode(props.prpConnectionToCodeAttr?.get(item)?.value ?? "");
                if (!fromCountryCode || !toCountryCode) {
                    return undefined;
                }
                return { fromCountryCode, toCountryCode };
            })
            .filter((connection): connection is RegionConnection => connection !== undefined);
    }, [props.prpConnections, props.prpConnectionFromCodeAttr, props.prpConnectionToCodeAttr]);

    useEffect(() => {
        if (!props.prpConnections || props.prpConnections.status === ValueStatus.Available) {
            store.setConnections(connections);
        }
    }, [connections, props.prpConnections, store]);

    // --- Selection: click -> store + Mendix attribute/action ---
    const handleRegionClick = useCallback(
        (region: Region) => {
            store.setSelectedRegion(region.id);
            props.prpSelectedRegionIdAttribute?.setValue(region.id);
            if (props.prpOnRegionClick?.canExecute) {
                props.prpOnRegionClick.execute({ regionId: region.id, countryCode: region.countryCode });
            }
        },
        [props.prpSelectedRegionIdAttribute, props.prpOnRegionClick, store]
    );

    const fills: CountryFillConfig = {
        default: "#E5E9F0",
        stroke: "#FFFFFF"
    };

    if (props.prpRegions.status !== ValueStatus.Available) {
        return null;
    }

    return (
        <WorldMapView
            className={props.class}
            style={props.style}
            store={store}
            fills={fills}
            markerColor={props.prpMarkerColor}
            markerColorMode={props.prpMarkerColorMode}
            minMarkerSize={props.prpMinMarkerSize}
            maxMarkerSize={props.prpMaxMarkerSize}
            showLabels={props.prpShowLabels}
            showConnectionLines
            connectionLineColor="#334155"
            connectionLineWidth={1.5}
            enableZoom={props.prpEnableZoom}
            onRegionClick={handleRegionClick}
        />
    );
}

export const WorldMapSync = observer(WorldMapSyncComponent);
