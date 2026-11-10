import { useMemo, useState } from "react";
import Big from "big.js";
import type { ActionValue, EditableValue, Option } from "mendix";

import { IRISWorldMap } from "../../widgets/iris-worldmap/src/IRISWorldMap";
import type { PrpMarkerColorModeEnum } from "../../widgets/iris-worldmap/typings/IRISWorldMapProps";
import {
    createEditableValue,
    createListAttributeValue,
    createListValue,
} from "./mocks/mendixMocks";
import {
    MOCK_CONNECTIONS,
    MOCK_REGIONS,
    MockConnectionRecord,
    MockRegionRecord,
} from "./mocks/worldMapFixtures";

export function IRISWorldMapDemo() {
    const [showConnections, setShowConnections] = useState(true);
    const [showLabels, setShowLabels] = useState(false);
    const [markerColorMode, setMarkerColorMode] = useState<PrpMarkerColorModeEnum>("fixed");
    const [lastClick, setLastClick] = useState("—");

    const regionsValue = useMemo(() => createListValue(MOCK_REGIONS), []);
    const regionIdAttr = useMemo(
        () =>
            createListAttributeValue<string | Big>(
                "mock.RegionId",
                (item) => (item as unknown as MockRegionRecord).regionId,
            ),
        [],
    );
    const regionCountryCodeAttr = useMemo(
        () =>
            createListAttributeValue(
                "mock.RegionCountryCode",
                (item) => (item as unknown as MockRegionRecord).countryCode,
            ),
        [],
    );
    const regionNameAttr = useMemo(
        () =>
            createListAttributeValue(
                "mock.RegionName",
                (item) => (item as unknown as MockRegionRecord).name,
            ),
        [],
    );
    const regionLatitudeAttr = useMemo(
        () =>
            createListAttributeValue<Big>(
                "mock.RegionLatitude",
                (item) => new Big((item as unknown as MockRegionRecord).latitude),
            ),
        [],
    );
    const regionLongitudeAttr = useMemo(
        () =>
            createListAttributeValue<Big>(
                "mock.RegionLongitude",
                (item) => new Big((item as unknown as MockRegionRecord).longitude),
            ),
        [],
    );
    const regionStatusAttr = useMemo(
        () =>
            createListAttributeValue(
                "mock.RegionStatus",
                (item) => (item as unknown as MockRegionRecord).status,
            ),
        [],
    );
    const regionCategoryAttr = useMemo(
        () =>
            createListAttributeValue(
                "mock.RegionCategory",
                (item) => (item as unknown as MockRegionRecord).category,
            ),
        [],
    );
    const regionValueAttr = useMemo(
        () =>
            createListAttributeValue<Big>("mock.RegionValue", (item) => {
                const value = (item as unknown as MockRegionRecord).value;
                return value === undefined ? undefined : new Big(value);
            }),
        [],
    );

    const connectionsValue = useMemo(
        () => createListValue(showConnections ? MOCK_CONNECTIONS : []),
        [showConnections],
    );
    const connectionFromCodeAttr = useMemo(
        () =>
            createListAttributeValue(
                "mock.ConnectionFrom",
                (item) => (item as unknown as MockConnectionRecord).fromCountryCode,
            ),
        [],
    );
    const connectionToCodeAttr = useMemo(
        () =>
            createListAttributeValue(
                "mock.ConnectionTo",
                (item) => (item as unknown as MockConnectionRecord).toCountryCode,
            ),
        [],
    );

    const selectedRegionIdAttribute: EditableValue<string> = useMemo(
        () => createEditableValue<string>(undefined),
        [],
    );
    const onRegionClick: ActionValue<{ regionId: Option<string>; countryCode: Option<string> }> =
        useMemo(
            () =>
                ({
                    canExecute: true,
                    isExecuting: false,
                    execute: ({
                        regionId,
                        countryCode,
                    }: {
                        regionId: Option<string>;
                        countryCode: Option<string>;
                    }) => setLastClick(`${regionId ?? "—"} (${countryCode ?? "—"})`),
                }) as unknown as ActionValue<{
                    regionId: Option<string>;
                    countryCode: Option<string>;
                }>,
            [],
        );

    return (
        <section>
            <h2>IRISWorldMap</h2>
            <p className="app__hint">
                Uses AG Charts Enterprise Maps — without a licence key this shows a watermark and a
                console warning, which is expected in this local demo.
            </p>
            <div className="app__controls">
                <label>
                    <input
                        type="checkbox"
                        checked={showConnections}
                        onChange={(e) => setShowConnections(e.target.checked)}
                    />{" "}
                    Connection lines
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                    />{" "}
                    Region labels
                </label>
                <label>
                    Marker color{" "}
                    <select
                        value={markerColorMode}
                        onChange={(e) => setMarkerColorMode(e.target.value as PrpMarkerColorModeEnum)}
                    >
                        <option value="fixed">Fixed</option>
                        <option value="status">By status</option>
                        <option value="category">By category</option>
                    </select>
                </label>
            </div>

            <IRISWorldMap
                name="iris-worldmap-preview"
                class=""
                prpRegions={regionsValue}
                prpRegionIdAttr={regionIdAttr}
                prpRegionCountryCodeAttr={regionCountryCodeAttr}
                prpRegionNameAttr={regionNameAttr}
                prpRegionLatitudeAttr={regionLatitudeAttr}
                prpRegionLongitudeAttr={regionLongitudeAttr}
                prpRegionStatusAttr={regionStatusAttr}
                prpRegionCategoryAttr={regionCategoryAttr}
                prpRegionValueAttr={regionValueAttr}
                prpConnections={connectionsValue}
                prpConnectionFromCodeAttr={connectionFromCodeAttr}
                prpConnectionToCodeAttr={connectionToCodeAttr}
                prpEnableZoom
                prpMarkerColorMode={markerColorMode}
                prpMarkerColor="#1F2937"
                prpMinMarkerSize={6}
                prpMaxMarkerSize={32}
                prpShowLabels={showLabels}
                prpSelectedRegionIdAttribute={selectedRegionIdAttribute}
                prpOnRegionClick={onRegionClick}
            />

            <p>
                Last region click: <code>{lastClick}</code>
            </p>
        </section>
    );
}
