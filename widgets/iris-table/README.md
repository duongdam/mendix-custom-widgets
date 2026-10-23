# AxNewCustomTable (iris-table)

A data table pluggable widget for Mendix, built on [antd Table](https://ant.design/components/table).

It works in two modes:

| | **Dynamic** (default) | **Datasource** |
|---|---|---|
| Data comes from | Two JSON strings: **Header JSON** + **Data JSON** | Mendix datasources: **Columns** + **Data Items** |
| Paging, sorting, search | In the browser (all rows are loaded at once) | Server-driven: the widget writes Offset / Limit / Filter attributes and runs **On Fetch Data** |
| Good for | Up to hundreds of thousands of rows, tree data | Large tables that must stay in the database |
| Scrolling | **Pages** or **Virtual scroll** | Pages or Load more |
| Column formatting (number, currency, date, badge) | Yes | Not yet (cells show the raw value) |

---

## 1. Quick start

1. Add **Ax New Custom Table** to a page (it needs a context object only if your attributes are bound to one).
2. Choose **Data Mode** under **General**.
3. Fill in the data properties of that mode (sections 2 and 3 below).
4. Optionally bind **On Selection Change**, **On Row Click** and **On Row Double Click**.

Try it without Studio Pro (mock data for both modes):

```bash
pnpm --filter @iris/mock-ui dev      # then open http://localhost:5173
```

Pick **AxNewCustomTable** (Datasource demo) or **AxNewCustomTable (Dynamic)** in the sidebar. The demo sources are
`mock-ui/src/AxNewCustomTableDatasourceDemo.tsx` and `mock-ui/src/AxNewCustomTableDynamicDemo.tsx`.

---

## 2. Dynamic mode

Set **Data Mode = Dynamic (JSON)**, then bind two string attributes:

- **Header JSON** — the columns.
- **Data JSON** — the rows.

Both must be valid JSON. Invalid JSON is treated as empty.

### 2.1 Header JSON

A JSON array of column objects.

```json
[
  { "header": "id",         "label": "ID",          "width": 70,  "align": "right", "formatType": "number" },
  { "header": "name",       "label": "Name",        "treeColumn": true, "grow": 2 },
  { "header": "email",      "label": "Email",       "minWidth": 180, "grow": 2 },
  { "header": "revenue",    "label": "Revenue",     "width": 140, "align": "right", "formatType": "currency", "formatPattern": "USD" },
  { "header": "signupDate", "label": "Signup Date", "width": 150, "formatType": "date" },
  { "header": "status",     "label": "Status",      "width": 120, "align": "center", "formatType": "badge",
    "badgeColors": { "active": "green", "pending": "orange", "suspended": "red", "archived": "gray" } },
  { "header": "internalNote", "label": "Internal Note", "hidden": true }
]
```

| Field | Type | Default | Description |
|---|---|---|---|
| `header` | string | — (required) | Field name in each Data JSON row. |
| `label` | string | `header` | Column title. |
| `order` | number | position in the array | Column order (ascending). |
| `width` | number or string | auto | **Fixed** width. A number means pixels; `"20%"`, `"8rem"` also work in Pages mode. |
| `minWidth` | number or string | `100` px | Smallest size of an **auto-sized** column. |
| `grow` | number | `1` | Share of the remaining room for auto-sized columns (**Virtual scroll** only). |
| `sortable` | boolean | `true` | Click the header to sort. |
| `align` | `"left"` \| `"center"` \| `"right"` | `"left"` | Cell alignment. |
| `wrap` | boolean | `false` | `true` wraps long text; `false` shows `...` and the full text in a hover tooltip. |
| `hidden` | boolean | `false` | `true` hides the column (hidden columns are not searched). |
| `formatType` | `"text"` \| `"number"` \| `"currency"` \| `"date"` \| `"badge"` | `"text"` | How the value is displayed. |
| `formatPattern` | string | — | See below. |
| `badgeColors` | object | — | For `badge`: value (case-insensitive) → colour. |
| `treeColumn` | boolean | first column | Column that holds the expand icon for tree data (section 2.3). |

**Fixed vs. auto-sized columns:** a column with `width` keeps exactly that width. Columns without `width` share the rest
of the table width; `minWidth` stops them from getting too small, and (in Virtual scroll) `grow` sets their proportion.

**Format patterns**

| `formatType` | `formatPattern` | Example result |
|---|---|---|
| `number` | number of decimals, e.g. `"2"` | `1,234.50` |
| `currency` | ISO currency code (default `USD`) | `$1,234.50` |
| `date` | empty = locale date; `"iso"`, `"time"`, `"datetime"` | `1/19/2024` |
| `badge` | — | coloured pill |

**Badge colours:** `blue`, `green`, `red`, `orange`, `purple`, `gray`, or any `#hex`. Common status words
(`active`, `pending`, `failed`, `done`, `closed`, ...) are coloured automatically when not listed in `badgeColors`.

### 2.2 Data JSON

A JSON array of row objects. Each key is a column `header`.

```json
[
  { "RowKey": "1", "id": 1, "name": "Alex Nguyen", "email": "alex.nguyen1@example.com",
    "revenue": 237.5, "signupDate": "2024-01-01T00:00:00.000Z", "status": "Active" },
  { "RowKey": "2", "id": 2, "name": "Bao Do", "email": "bao.do2@example.com",
    "revenue": 474.5, "signupDate": "2024-01-04T00:00:00.000Z", "status": "Pending" },
  { "RowKey": "3", "id": 3, "name": "Chi Vo", "email": "chi.vo3@example.com",
    "revenue": 711.5, "signupDate": "2024-01-07T00:00:00.000Z", "status": "Suspended", "HasInvalid": true }
]
```

Reserved fields:

| Field | Description |
|---|---|
| `RowKey` | Unique key of the row. Returned to your actions as `rowKey` / `selectedKeys`. If missing, the row index is used. |
| `ParentRowKey` | `RowKey` of the parent row — makes the row a child (section 2.3). |
| `HasInvalid` | `true` disables the row: greyed out, default cursor, not selectable, no click / double click / expand. Select all skips it. |

### 2.3 Tree data (expandable child rows)

Add `ParentRowKey` to child rows and turn on **Row Behavior → Enable Expandable Rows**. Any depth is supported.
The demo uses three levels:

```json
[
  { "RowKey": "1", "name": "Region EMEA" },
  { "RowKey": "2", "ParentRowKey": "1", "name": "Germany" },
  { "RowKey": "3", "ParentRowKey": "1", "name": "France" },
  { "RowKey": "4", "ParentRowKey": "2", "name": "Berlin office" },
  { "RowKey": "5", "ParentRowKey": "2", "name": "Munich office" },
  { "RowKey": "6", "ParentRowKey": "3", "name": "Paris office" },
  { "RowKey": "7", "name": "Region APAC" }
]
```

Rules:

- Rows with children get an expand icon (placed in the column with `"treeColumn": true`, otherwise the first column).
  **If no row has a valid `ParentRowKey`, no expand icon is shown.**
- A `ParentRowKey` that points to a missing row, or that creates a loop, is ignored (the row becomes a top-level row).
- **Expand On Row Click** makes a click on the row toggle it.
- Search keeps matching rows **and their parents**, and opens the branches that contain a match. Clearing the search
  collapses them again.
- Sorting applies within each group of siblings.
- In **Pages** mode, the page size counts top-level rows only; children stay under their parent.

### 2.4 Scroll Mode (Dynamic only)

| | **Pages** | **Virtual scroll** |
|---|---|---|
| Layout | Page footer (see **Pagination**) | One scrolling window, no pages |
| Rows rendered | One page | Only the rows in view |
| Best for | Normal sized data | Very large data (tested with 500,000 rows) |
| Notes | — | Needs a pixel **Fixed Header Scroll Height** (e.g. `400px`); Pagination settings are ignored |

Select all, search and sort work on **all** rows in both modes.

---

## 3. Datasource mode

Set **Data Mode = Datasource**. You provide two lists, plus a microflow that returns one page of rows each time the
user pages, changes the page size or searches.

### 3.1 Domain model used in the demo

```
Column  (persistent or non-persistent)
  Key       String    e.g. "name"
  Label     String    e.g. "Name"
  Width     String    e.g. "140px"  (empty = auto)
  Sortable  Boolean
  Visible   Boolean

Row  (non-persistent is fine)
  RowKey     String or Long   unique and stable
  RowValues  String           JSON object: column Key -> value

TableQuery  (the page's context object, non-persistent)
  Offset      Integer/Long
  Limit       Integer/Long
  FilterText  String
  TotalCount  Integer/Long
```

Example **Columns** (one object per column):

| Key | Label | Width | Sortable | Visible |
|---|---|---|---|---|
| `name` | Name | | true | true |
| `email` | Email | | false | true |
| `revenue` | Revenue | `140px` | true | true |
| `signupDate` | Signup Date | `150px` | true | true |
| `status` | Status | `120px` | false | true |
| `internalNote` | Internal Note | | false | **false** |

Example **Rows** (`RowValues` holds one JSON object per row):

| RowKey | RowValues |
|---|---|
| `1` | `{"name":"Alex Nguyen","email":"alex.nguyen1@example.com","revenue":237.5,"signupDate":"2024-01-01","status":"Active"}` |
| `2` | `{"name":"Bao Do","email":"bao.do2@example.com","revenue":474.5,"signupDate":"2024-01-04","status":"Pending","ParentRowKey":"1"}` |
| `3` | `{"name":"Chi Vo","email":"chi.vo3@example.com","revenue":711.5,"signupDate":"2024-01-07","status":"Suspended","HasInvalid":true}` |

`ParentRowKey` (child rows) and `HasInvalid` (disabled row) work here exactly as in Dynamic mode — put them inside
`RowValues`. With paging, a child only nests under its parent when both are on the loaded page.

### 3.2 Property setup

| Group → Property | Bind to |
|---|---|
| **Datasource → Columns** → *Columns* | list of `Column` |
| … *Column Key / Label / Width / Sortable / Visible* | `Column.Key / Label / Width / Sortable / Visible` |
| **Datasource → Rows** → *Data Items* | list of `Row` (the **current page** only) |
| … *Row Key* | `Row.RowKey` |
| … *Row Values (JSON)* | `Row.RowValues` |
| **Datasource → Fetch** → *On Fetch Data* | the microflow in 3.3 |
| … *Offset Attribute* / *Limit Attribute* | `TableQuery.Offset` / `TableQuery.Limit` |
| … *Total Count Attribute* | `TableQuery.TotalCount` |
| … *Filter Text Attribute* | `TableQuery.FilterText` |

### 3.3 The fetch microflow

The widget runs **On Fetch Data** (no parameters) after writing the attributes, whenever the page, page size or search
text changes (and once when the table first shows). The microflow must **refresh the Data Items list** and set
`TotalCount`:

1. Read `TableQuery.Offset`, `TableQuery.Limit`, `TableQuery.FilterText`.
2. Retrieve rows with that offset and limit. If `FilterText` is not empty, add it to the XPath, e.g.
   `[contains(Name, $TableQuery/FilterText) or contains(Email, $TableQuery/FilterText)]`.
3. Fill the `Row` list that **Data Items** is bound to (set `RowKey` and build `RowValues` JSON).
4. Set `TableQuery.TotalCount` to the number of rows matching the filter (without paging).

If **Total Count Attribute** is not bound, the widget assumes there is a next page whenever a full page came back.

### 3.4 Pagination mode

| Mode | Behaviour |
|---|---|
| **Pages** | Page footer. Each fetch **replaces** the rows. |
| **Load more** | No footer. A **Load more** button fetches the next page and **appends** it (disabled when there are no more rows). |

Search always resets to page 1. Sorting (columns with `Sortable = true`) sorts the rows **of the loaded page** in the
browser.

---

## 4. Settings reference

### General
| Property | Description |
|---|---|
| Data Mode | Dynamic (JSON) or Datasource. |
| Scroll Mode (Dynamic) | Pages or Virtual scroll. |
| Is Loading | Shows the loading state while the attribute is true (works in both modes). |
| Show Search Box / Search Placeholder / Search Debounce (ms) | Search box on the right of the toolbar. Dynamic mode searches the displayed text of every visible column. |

### Pagination
Enable Pagination, Pagination Mode (Datasource only), Default Page Size, Page Size Options (comma-separated, e.g. `10,20,50,100`).
Ignored in Virtual scroll.

### Selection
| Property | Description |
|---|---|
| Enable Row Selection | Shows checkboxes (header checkbox = select all loaded rows, across Dynamic pages). |
| Single Row Selection | Radio buttons instead of checkboxes. |
| Highlight Selected Rows | Tints selected rows. |
| On Selection Change | Receives `selectedKeys`: the selected `RowKey`s joined by commas (empty string when nothing is selected). |

Clicking anywhere on a row (outside buttons, links and inputs) toggles its selection.

### Row Behavior
| Property | Description |
|---|---|
| Enable Expandable Rows | Child rows via `ParentRowKey`. |
| Expand On Row Click | Clicking a row expands/collapses it. |
| Pointer Cursor On Hover | Hand cursor over rows. |
| On Row Click | Receives `rowKey`. |
| On Row Double Click | Receives `rowKey`. A double click also fires On Row Click twice. |

Rows flagged `HasInvalid` never fire any of these.

### Table Style
Striped Rows, Highlight On Hover, Dense, Responsive (horizontal scroll), Fixed Header, Fixed Header Scroll Height
(e.g. `400px`), Persist Table Head (kept for compatibility; the header is always visible).

### Text Labels
| Property | Default |
|---|---|
| No Data Text | `There are no records to display` |
| Loading Text | `Loading...` |
| Total Text | `Total {count} items` — `{count}` is the number of rows; leave empty to hide. |
| Load More Text | `Load more` |

The **Total** text shows the number of rows after search (Dynamic) or the server total (Datasource).

---

## 5. Tips

- **Large data:** use Dynamic + **Virtual scroll**. Give fixed `width`s to short columns (ID, date, status) and let text
  columns auto-size.
- **Long text:** keep `wrap` off; users see `...` and can hover for the full text.
- **Row keys must be unique and stable** — selection and expansion are tracked by `RowKey`.
- **Changing the data** (new Data JSON) keeps the selection only for rows that still exist and are not invalid.
- **Number values:** send real numbers (`237.5`), not pre-formatted strings, so sorting and formatting work.
- **Dates:** send ISO strings (`2024-01-01T00:00:00.000Z`).
- Hidden columns (`hidden: true` / `Visible = false`) are not shown and are not searched.

## 6. Development

```bash
pnpm --filter axnewcustomtable build      # build the .mpk (dist/1.0.0/)
pnpm --filter axnewcustomtable typecheck
```

Source layout (`src/`):

| Path | Purpose |
|---|---|
| `AxNewCustomTable.tsx` / `.xml` / `.editorPreview.tsx` | Widget entry, property definitions, Studio Pro preview |
| `components/TableDataSync.tsx` | Mendix props → store (parsing, fetch, actions) |
| `components/TableContainer.tsx` | Toolbar (total, search) + table + Load more |
| `components/AntdTable.tsx` | The antd table: columns, selection, tree, paging, virtual scroll |
| `store/TableStore.ts` | MobX state (rows, columns, page, limit, search) |
| `utils/` | `columnMapper`, `formatters`, `parseDynamicJson`, `parseRowValues`, `rowTree` |
| `ui/AxNewCustomTable.css` | Styles |
