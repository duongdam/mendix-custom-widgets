import countryCodeMap from "../assets/maps/countryCodeMap";

const CODE_MAP = countryCodeMap as Record<string, string>;

// Normalizes an ISO 3166-1 alpha-2 OR alpha-3 country code (any case) to the canonical uppercase
// alpha-2 form, so business regions/connections from Mendix can be matched and compared
// consistently regardless of which form the data source used.
export function normalizeCountryCode(code: string): string | undefined {
    return CODE_MAP[code.trim().toUpperCase()];
}
