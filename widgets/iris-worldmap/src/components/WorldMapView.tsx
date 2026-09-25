import { CSSProperties, ReactElement, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { AgCharts } from "ag-charts-react";
import {
    AllMapSeriesModule,
    LegendModule,
    ModuleRegistry,
    ZoomModule,
    type AgChartOptions,
    type GeoJSON
} from "ag-charts-enterprise";
import classNames from "classnames";

import { WorldMapStore } from "../store/WorldMapStore";
import { Region } from "../types/WorldMapTypes";
import continentTopology from "../assets/maps/continentTopology";
import { CONTINENT_DATASETS, ContinentCountryDatum } from "../assets/maps/continentData";

// Registered once at module scope, matching AG Charts' recommended "register near the app
// bootstrap" pattern — ModuleRegistry.registerModules is idempotent.
ModuleRegistry.registerModules([AllMapSeriesModule, ZoomModule, LegendModule]);

export interface CountryFillConfig {
    default: string;
    stroke: string;
}

export interface WorldMapViewProps {
    className?: string;
    style?: CSSProperties;
    store: WorldMapStore;
    fills: CountryFillConfig;
    markerColor: string;
    minMarkerSize: number;
    maxMarkerSize: number;
    showLabels: boolean;
    showConnectionLines: boolean;
    connectionLineColor: string;
    connectionLineWidth: number;
    enableZoom: boolean;
    onRegionClick: (region: Region) => void;
}

// "northAmerica" -> "North America" — matches the AG Charts "multiple shape series" reference
// example, which titles each continent series this way for its legend entries.
function convertLowerCamelCaseToTitleCase(value: string): string {
    return [...value].reduce((acc, char, index) => {
        if (index === 0) {
            return char.toLocaleUpperCase();
        }
        if (char === char.toLocaleUpperCase()) {
            return `${acc} ${char}`;
        }
        return acc + char;
    }, "");
}

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
});

// Same tooltip content as the reference example (population + GDP + GDP per capita), just reused
// against our own topology/data plumbing.
function continentTooltipRenderer(params: { datum: unknown }): {
    heading: string;
    title: string;
    data: Array<{ label: string; value: string }>;
} {
    const datum = params.datum as ContinentCountryDatum;
    const gdpPerCapita =
        datum.gdp_md > 0 && datum.pop_est > 0
            ? compactNumberFormatter.format(Math.round((datum.gdp_md * 1000000) / datum.pop_est))
            : undefined;
    const heading = datum.name.length > 15 ? `${datum.iso3}\n${datum.name}` : `${datum.iso3} - ${datum.name}`;
    return {
        heading,
        title: `Population ${compactNumberFormatter.format(datum.pop_est)}`,
        data: [
            { label: "GDP", value: `$${compactNumberFormatter.format(datum.gdp_md)}` },
            { label: "per Capita", value: gdpPerCapita ? `$${gdpPerCapita}` : "N/A" }
        ]
    };
}

interface ConnectionDatum {
    id: string;
}

interface LineStringFeature {
    type: "Feature";
    properties: { id: string };
    geometry: { type: "LineString"; coordinates: Array<[number, number]> };
}

const CURVE_STEPS = 24;
const CURVATURE = 0.18;

// A gently bowed "flight path" arc between two points, approximated with a quadratic Bezier in
// lng/lat space — plain straight lines read as harsh, overlapping rulers once several connections
// share the map, especially near-horizontal ones spanning most of its width.
function curvedLine(from: [number, number], to: [number, number]): Array<[number, number]> {
    const midX = (from[0] + to[0]) / 2;
    const midY = (from[1] + to[1]) / 2;
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const length = Math.hypot(dx, dy) || 1;
    // Perpendicular unit vector, scaled by curvature * distance, bows the arc consistently
    // whether a connection runs mostly east-west or north-south.
    const controlX = midX + (-dy / length) * length * CURVATURE;
    const controlY = midY + (dx / length) * length * CURVATURE;

    return Array.from({ length: CURVE_STEPS + 1 }, (_, i) => {
        const t = i / CURVE_STEPS;
        const inv = 1 - t;
        const x = inv * inv * from[0] + 2 * inv * t * controlX + t * t * to[0];
        const y = inv * inv * from[1] + 2 * inv * t * controlY + t * t * to[1];
        return [x, y] as [number, number];
    });
}

// AG Charts' map-line series matches data to topology features by id, like map-shape — there is
// no "position from data" mode for lines (unlike map-marker), so a from/to region pair becomes a
// tiny synthetic GeoJSON LineString feature generated on the fly, matched by a per-connection id.
function buildConnectionsTopology(
    connections: WorldMapStore["connections"],
    regions: Region[]
): { topology: GeoJSON; data: ConnectionDatum[] } {
    const regionByCountry = new Map<string, Region>();
    for (const region of regions) {
        regionByCountry.set(region.countryCode, region);
    }

    const features: LineStringFeature[] = [];
    const data: ConnectionDatum[] = [];
    connections.forEach((connection, index) => {
        const from = regionByCountry.get(connection.fromCountryCode);
        const to = regionByCountry.get(connection.toCountryCode);
        if (!from || !to) {
            return;
        }
        const id = `connection-${index}`;
        features.push({
            type: "Feature",
            properties: { id },
            geometry: {
                type: "LineString",
                coordinates: curvedLine([from.longitude, from.latitude], [to.longitude, to.latitude])
            }
        });
        data.push({ id });
    });

    return { topology: { type: "FeatureCollection", features }, data };
}

function WorldMapViewComponent({
    className,
    style,
    store,
    fills,
    markerColor,
    minMarkerSize,
    maxMarkerSize,
    showLabels,
    showConnectionLines,
    connectionLineColor,
    connectionLineWidth,
    enableZoom,
    onRegionClick
}: WorldMapViewProps): ReactElement {
    const hasValues = useMemo(() => store.regions.some(region => region.value !== undefined), [store.regions]);
    const connectionsGeography = useMemo(
        () => buildConnectionsTopology(store.connections, store.regions),
        [store.connections, store.regions]
    );

    const options = useMemo<AgChartOptions>(() => {
        // The default base map: every country coloured per continent, exactly like the AG Charts
        // "multiple shape series" reference — one map-shape series per continent with real
        // population/GDP data, no explicit fill (AG Charts assigns each series the next colour in
        // its categorical palette), which is what makes the map read as colourful rather than a
        // single flat highlight tone. This is unconditional, not tied to any business data.
        const continentSeries: AgChartOptions["series"] = Object.entries(CONTINENT_DATASETS).map(([key, data]) => ({
            type: "map-shape" as const,
            topology: continentTopology as GeoJSON,
            data,
            title: convertLowerCamelCaseToTitleCase(key),
            idKey: "name",
            topologyIdKey: "NAME_ENGL",
            labelKey: "iso2",
            labelName: "Country Code",
            label: { enabled: true, color: "#1F2937", fontSize: 9 },
            fillOpacity: 0.85,
            strokeWidth: 0.5,
            stroke: fills.stroke,
            cursor: "default",
            showInLegend: true,
            highlight: { highlightedItem: { fillOpacity: 1, strokeWidth: 1.25 } },
            tooltip: { renderer: continentTooltipRenderer }
        }));

        const series: AgChartOptions["series"] = [
            {
                type: "map-shape-background",
                topology: continentTopology as GeoJSON,
                fill: fills.default,
                stroke: fills.stroke,
                strokeWidth: 0.5
            },
            ...continentSeries
        ];

        if (showConnectionLines && connectionsGeography.data.length > 0) {
            series.push({
                type: "map-line",
                idKey: "id",
                topologyIdKey: "id",
                topology: connectionsGeography.topology,
                data: connectionsGeography.data,
                stroke: connectionLineColor,
                strokeWidth: connectionLineWidth,
                strokeOpacity: 0.55,
                lineDash: [4, 3],
                showInLegend: false,
                tooltip: { enabled: false }
            });
        }

        series.push({
            type: "map-marker",
            idKey: "id",
            latitudeKey: "latitude",
            longitudeKey: "longitude",
            sizeKey: hasValues ? "value" : undefined,
            labelKey: showLabels ? "name" : undefined,
            label: { enabled: showLabels, color: "#1F2937", fontSize: 11 },
            data: store.regions,
            fill: markerColor,
            fillOpacity: 0.75,
            stroke: "#ffffff",
            strokeWidth: 1.5,
            strokeOpacity: 0.9,
            size: minMarkerSize,
            minSize: minMarkerSize,
            maxSize: maxMarkerSize,
            cursor: "pointer",
            showInLegend: false,
            highlight: { highlightedItem: { fillOpacity: 1, strokeWidth: 2 } },
            tooltip: {
                renderer: params => {
                    const region = params.datum as Region;
                    return {
                        heading: region.category ?? region.name,
                        title: region.name,
                        data: [
                            ...(region.value !== undefined
                                ? [{ label: "Value", value: region.value.toLocaleString() }]
                                : []),
                            ...(region.status ? [{ label: "Status", value: region.status }] : [])
                        ]
                    };
                }
            },
            listeners: {
                seriesNodeClick: event => onRegionClick(event.datum as Region)
            }
        });

        return {
            background: { fill: "transparent" },
            padding: 12,
            series,
            zoom: { enabled: enableZoom },
            legend: { enabled: true, position: "right", item: { marker: { shape: "circle" } } }
        } as AgChartOptions;
    }, [
        fills,
        showConnectionLines,
        connectionsGeography,
        connectionLineColor,
        connectionLineWidth,
        hasValues,
        showLabels,
        store.regions,
        markerColor,
        minMarkerSize,
        maxMarkerSize,
        enableZoom,
        onRegionClick
    ]);

    return (
        <div className={classNames("iris-worldmap", className)} style={style}>
            <AgCharts options={options} />
        </div>
    );
}

export const WorldMapView = observer(WorldMapViewComponent);
