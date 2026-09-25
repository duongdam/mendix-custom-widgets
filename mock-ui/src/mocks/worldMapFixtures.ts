export interface MockRegionRecord {
    // Named `regionId`, not `id` — createListValue's mock ObjectItem wrapper spreads the raw
    // record and then overwrites `id` with its own synthetic value, so a same-named field would
    // silently disappear.
    regionId: string;
    countryCode: string;
    name: string;
    latitude: number;
    longitude: number;
    status?: string;
    category?: string;
    value?: number;
}

export interface MockConnectionRecord {
    fromCountryCode: string;
    toCountryCode: string;
}

/** Sample global footprint: HQ in Korea, connected to a handful of regional sites. */
export const MOCK_REGIONS: MockRegionRecord[] = [
    { regionId: "kr-hq", countryCode: "KR", name: "Korea HQ", latitude: 37.5665, longitude: 126.978, status: "active", category: "Headquarters", value: 12000 },
    { regionId: "us-office", countryCode: "US", name: "USA Office", latitude: 40.7128, longitude: -74.006, status: "active", category: "Office", value: 3200 },
    { regionId: "vn-factory", countryCode: "VN", name: "Vietnam Factory", latitude: 21.0278, longitude: 105.8342, status: "active", category: "Factory", value: 8100 },
    { regionId: "in-office", countryCode: "IN", name: "India Office", latitude: 28.6139, longitude: 77.209, status: "warning", category: "Office", value: 2400 },
    { regionId: "br-warehouse", countryCode: "BR", name: "Brazil Warehouse", latitude: -23.5505, longitude: -46.6333, status: "active", category: "Warehouse", value: 1500 },
    { regionId: "de-office", countryCode: "DE", name: "Germany Office", latitude: 52.52, longitude: 13.405, status: "inactive", category: "Office", value: 900 },
    { regionId: "cn-factory", countryCode: "CN", name: "China Factory", latitude: 31.2304, longitude: 121.4737, status: "active", category: "Factory", value: 9700 }
];

export const MOCK_CONNECTIONS: MockConnectionRecord[] = [
    { fromCountryCode: "KR", toCountryCode: "US" },
    { fromCountryCode: "KR", toCountryCode: "VN" },
    { fromCountryCode: "KR", toCountryCode: "IN" },
    { fromCountryCode: "KR", toCountryCode: "CN" },
    { fromCountryCode: "US", toCountryCode: "BR" },
    { fromCountryCode: "KR", toCountryCode: "DE" }
];
