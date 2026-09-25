// Business data — never mixed with map geometry (see utils/countryCode and assets/maps/continentTopology).
export type RegionStatus = "active" | "warning" | "inactive" | string;

export interface Region {
    id: string;
    /** Normalized to the canonical alpha-2 form — see utils/countryCode.ts. */
    countryCode: string;
    name: string;
    latitude: number;
    longitude: number;
    status?: RegionStatus;
    category?: string;
    value?: number;
}

export interface RegionConnection {
    fromCountryCode: string;
    toCountryCode: string;
}
