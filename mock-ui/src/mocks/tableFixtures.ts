export interface MockColumnRecord {
    key: string;
    label: string;
    order: number;
    width?: string;
    minWidth?: string;
    grow?: number;
    sortable?: boolean;
    visible?: boolean;
    align?: string;
    wrap?: boolean;
    formatType?: string;
    formatPattern?: string;
}

/** Column metadata, as if returned by a "get columns" microflow/nanoflow. Deliberately covers
 * every format type plus a hidden column, to exercise columnMapper's defaulting/visibility logic. */
export const MOCK_COLUMNS: MockColumnRecord[] = [
    { key: "id", label: "ID", order: 0, width: "70px", sortable: true, align: "right", formatType: "number" },
    { key: "name", label: "Name", order: 1, sortable: true, grow: 2 },
    { key: "email", label: "Email", order: 2, grow: 2, wrap: true },
    {
        key: "revenue",
        label: "Revenue",
        order: 3,
        width: "140px",
        sortable: true,
        align: "right",
        formatType: "currency",
        formatPattern: "USD",
    },
    { key: "signupDate", label: "Signup Date", order: 4, width: "150px", sortable: true, formatType: "date" },
    { key: "status", label: "Status", order: 5, width: "120px", align: "center", formatType: "badge" },
    { key: "internalNote", label: "Internal Note", order: 6, visible: false },
];

export interface MockRowRecord {
    key: string;
    values: Record<string, unknown>;
}

const FIRST_NAMES = ["Alex", "Bao", "Chi", "Dan", "Emma", "Farid", "Giang", "Huy", "Ivy", "Jun"];
const LAST_NAMES = ["Nguyen", "Tran", "Le", "Pham", "Vo", "Dang", "Bui", "Do", "Ho", "Duong"];
const STATUSES = ["Active", "Pending", "Suspended", "Archived"];

/** Simulates a "get rows" microflow's full backing dataset — this never reaches the widget
 * directly, only the page `queryMockRows` slices out (mirroring server-side pagination). */
export function generateMockRows(count: number): MockRowRecord[] {
    return Array.from({ length: count }, (_, index) => {
        const id = index + 1;
        const first = FIRST_NAMES[index % FIRST_NAMES.length];
        const last = LAST_NAMES[(index * 7) % LAST_NAMES.length];
        const name = `${first} ${last}`;
        const status = STATUSES[index % STATUSES.length];
        const revenue = Math.round((((index + 1) * 137) % 9000) + 100 * ((index % 5) + 1)) + 0.5;
        const daysAgo = (index * 3) % 720;
        const signupDate = new Date(Date.UTC(2024, 0, 1) + daysAgo * 86400000).toISOString();
        return {
            key: String(id),
            values: {
                id,
                name,
                email: `${first}.${last}${id}@example.com`.toLowerCase(),
                revenue,
                signupDate,
                status,
                internalNote: `Internal note for row ${id} — not shown as a column.`,
            },
        };
    });
}

export interface QueryParams {
    offset: number;
    limit: number;
    sortField?: string;
    sortDirection?: "asc" | "desc";
    filterText?: string;
}

export interface QueryResult {
    rows: MockRowRecord[];
    totalCount: number;
}

/** Stand-in for what the app's "fetch data" microflow would do: filter, sort, then page —
 * the same offset/limit/sortField/sortDirection/filterText the widget writes before executing
 * fetchDataAction. */
export function queryMockRows(all: MockRowRecord[], params: QueryParams): QueryResult {
    let filtered = all;

    if (params.filterText && params.filterText.trim()) {
        const needle = params.filterText.trim().toLowerCase();
        filtered = all.filter(row => Object.values(row.values).some(value => String(value).toLowerCase().includes(needle)));
    }

    if (params.sortField) {
        const field = params.sortField;
        const dir = params.sortDirection === "desc" ? -1 : 1;
        filtered = [...filtered].sort((a, b) => {
            const av = a.values[field];
            const bv = b.values[field];
            if (av === bv) {
                return 0;
            }
            return (av! > bv! ? 1 : -1) * dir;
        });
    }

    const rows = filtered.slice(params.offset, params.offset + params.limit);
    return { rows, totalCount: filtered.length };
}
