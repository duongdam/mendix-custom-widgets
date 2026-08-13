# IRIS Widgets

A pnpm/Turborepo monorepo of Mendix Pluggable Widgets for the IRIS project — built with React 19, TypeScript, and a shared local **Mock UI** so you can develop and demo widgets without needing Mendix Studio Pro.

## Contents

- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Everyday workflow](#everyday-workflow)
- [Root scripts](#root-scripts)
- [Widgets](#widgets)
- [The Mock UI](#the-mock-ui)
- [Connecting a widget to a real Mendix project](#connecting-a-widget-to-a-real-mendix-project)
- [Creating a new widget](#creating-a-new-widget)
- [Linting & formatting conventions](#linting--formatting-conventions)
- [Troubleshooting / known gotchas](#troubleshooting--known-gotchas)

## Tech stack

| | |
|---|---|
| Package manager | [pnpm](https://pnpm.io) workspaces |
| Build orchestrator | [Turborepo](https://turborepo.dev) |
| Widget framework | [Mendix Pluggable Widgets](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets/) via `@mendix/pluggable-widgets-tools` |
| UI | React 19 + TypeScript 5.9 |
| Lint / format | ESLint 9 (flat config) + Prettier 3 at the repo root; each widget self-lints/formats with the Mendix-bundled ESLint 8 legacy config (see [below](#linting--formatting-conventions)) |
| Local dev harness | Vite + React, with hand-written mocks of the Mendix Client API (no Studio Pro required) |

## Repository layout

```
iris-widgets/
├── shared/
│   └── ax-common/            # @iris/ax-common — shared TS utilities consumed by widgets/mock-ui
├── widgets/
│   ├── iris-button/           # IRISButton — simple button, DynamicValue caption + ActionValue
│   ├── iris-card/              # IRISCard — editable title + item-count card
│   ├── iris-panel/             # IRISPanel — MobX + Ant Design panel scaffold
│   └── iris-multiselection/    # AxMultiSelect — virtualized multi-select list (react-window)
├── mock-ui/                    # Vite app that renders every widget against mocked Mendix props
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json                # shared base TS config, extended by every package
├── eslint.config.js              # flat config — governs shared/ and mock-ui/ only
└── .prettierrc / .prettierignore
```

Each widget under `widgets/*` is a standalone Mendix pluggable widget package (its own `package.json`, XML definition, `.mpk` build output) that also plugs into the shared pnpm workspace and Turborepo pipeline.

## Prerequisites

- **Node.js 22.18+** (pinned to `22.22.0` in [`.nvmrc`](.nvmrc)). If you use `nvm`:
  ```bash
  nvm install
  nvm use
  ```
  `@mendix/pluggable-widgets-tools` and Vite both require a modern Node — if your default `node -v` is older (e.g. 14/16/18), you **must** switch via nvm/fnm/volta before anything below will work.
- **pnpm**, via Corepack (bundled with Node):
  ```bash
  corepack enable
  ```
  The exact pnpm version is pinned in the root `package.json`'s `packageManager` field — Corepack will fetch it automatically the first time you run `pnpm`.

## Getting started

```bash
git clone <repo-url>
cd iris-widgets
nvm use              # if using nvm
corepack enable
pnpm install
```

On first install, pnpm may ask you to approve build scripts for a few native/postinstall packages (`@parcel/watcher`, `@swc/core`, `core-js`, `unrs-resolver`). These are already allow-listed in [`pnpm-workspace.yaml`](pnpm-workspace.yaml) (`allowBuilds`), so a plain `pnpm install` should just work.

Then start the Mock UI:

```bash
pnpm dev
```

This opens Vite at `http://localhost:5173` and renders all four widgets with mocked data — no Mendix Studio Pro or test project needed. See [The Mock UI](#the-mock-ui) below.

## Everyday workflow

1. `pnpm dev` — keep the Mock UI running while you edit a widget's `src/*.tsx`. Vite hot-reloads on save.
2. Edit the widget's `.xml` file when you add/change a property — then run `pnpm --filter <widget> build` (or just `pnpm build`) once; `@mendix/pluggable-widgets-tools` regenerates `typings/*Props.d.ts` from the XML automatically as part of the build.
3. Before committing, run the full check:
   ```bash
   pnpm typecheck && pnpm lint && pnpm build && pnpm format:check
   ```
   (or `pnpm format` to auto-fix formatting).
4. Widget package names in this repo (`irisbutton`, `iriscard`, etc.) are the pnpm/Turbo filter names — use `pnpm --filter <name> <script>` to target one widget, e.g. `pnpm --filter iriscard run lint`.

## Root scripts

Run from the repository root; each fans out via Turborepo to every workspace package.

| Script | What it does |
|---|---|
| `pnpm dev` | Starts the Mock UI dev server (`@iris/mock-ui` only) |
| `pnpm build` | Builds every package: `ax-common` → each widget's `.mpk` → the mock-ui static bundle |
| `pnpm typecheck` | `tsc --noEmit` in every package |
| `pnpm lint` | Lints every package (widgets use their own Mendix-bundled ESLint config; `ax-common`/`mock-ui` use the root flat config) |
| `pnpm format` / `pnpm format:check` | Prettier across `shared/` and `mock-ui/` (widgets format themselves — see below) |

Turborepo caches task output, so re-running `pnpm build` after touching only one widget only rebuilds that widget (and anything depending on it).

## Widgets

| Widget | Package (filter name) | Summary | Key properties |
|---|---|---|---|
| **IRISButton** | `irisbutton` | Simple button | `caption` (expression/string), `variant` (`primary`\|`secondary`), `onClick` (action) |
| **IRISCard** | `iriscard` | Card with an editable title and an item-count readout | `title` (attribute, editable), `items` (datasource) |
| **IRISPanel** | `irispanel` | Ant Design `Card` scaffold with a MobX-backed collapse toggle — starting point for a richer feature | `title` (expression, optional) |
| **AxMultiSelect** | `axmultiselect` | High-performance multi/single-select list with search, "select all", and `react-window` virtualization for large datasources | `items` (datasource), `keyAttribute`/`nameAttribute`, `prpSelectedItems` (comma-separated keys), `type` (`multi`\|`single`\|`onlyView`), `onChange` |

All four widgets:
- Live under `com.iris.widgets.<WidgetName>` (the Mendix widget ID / `packagePath`)
- Build to `widgets/<name>/dist/1.0.0/com.iris.widgets.<WidgetName>.mpk`
- Declare `react`/`react-dom`/`@types/react`/`@types/react-dom` as **peerDependencies** (see [Troubleshooting](#troubleshooting--known-gotchas) for why)

`IRISPanel` additionally uses **MobX** (`mobx` + `mobx-react-lite`) for local UI state and **Ant Design** (`antd`) as its component library — a different stack from the other three, which are plain React. Use whichever fits a given widget's needs; there's no repo-wide requirement to use MobX/antd for new widgets.

## The Mock UI

[`mock-ui/`](mock-ui) is a small Vite + React app that imports each widget's source directly (`widgets/*/src/*.tsx`) and renders it with hand-built stand-ins for the Mendix Client API, so you can develop and visually test widgets locally without Studio Pro.

- **`mock-ui/src/mocks/mendixMocks.ts`** — factory functions matching the shapes real Mendix widgets receive:
  - `createDynamicValue(value)` → `DynamicValue<T>`
  - `createEditableValue(value, onChange?)` → `EditableValue<T>` (string/boolean/Date)
  - `createActionValue(fn)` → `ActionValue`
  - `createListValue(items)` → `ListValue` (spreads each item's fields onto its `ObjectItem`, so attribute mocks can read them back)
  - `createListAttributeValue(id, getValue)` → `ListAttributeValue<T>`, for per-item attributes like AxMultiSelect's `keyAttribute`/`nameAttribute`

  These are intentionally partial mocks — they cover the fields real widgets read/call in practice, not the full Client API (formatting, sorting, and filtering are unmocked).

- **`mock-ui/src/mocks/*Fixtures.ts`** — sample datasets per widget (e.g. `multiSelectFixtures.ts` generates 5,000 mock records to exercise virtualization).

- **`mock-ui/src/<Widget>Demo.tsx`** — one file per widget, each wiring up its own fixtures + a few `<select>`/`<button>` controls so you can flip between states (variants, item counts, clearing a selection, etc.) without touching code. `App.tsx` just renders the four `*Demo` components — add a new one here whenever you scaffold a new widget.

- **`mock-ui/src/mocks/mendixRuntimeShim.ts`** + the `resolve.alias` in `vite.config.ts` — see [Troubleshooting](#troubleshooting--known-gotchas).

To add a demo for a new widget: create fixtures (if needed) + a `<Widget>Demo.tsx` following the existing pattern, then add `<YourWidgetDemo />` to `mock-ui/src/App.tsx`.

## Connecting a widget to a real Mendix project

Each widget's `package.json` has:
```json
"config": { "projectPath": "" }
```
Set this to an absolute path to a local Mendix test project (or set the `MX_PROJECT_PATH` env var, which takes priority) to use `pnpm --filter <widget> run start`, which runs `pluggable-widgets-tools start:web` in watch mode and copies the built widget into that project so you can preview it live in Mendix Studio Pro. Without a project path configured, the tool falls back to `tests/testProject` inside the widget (not present in this repo) — which is fine, since day-to-day development happens through the Mock UI instead.

## Creating a new widget

Follow the pattern of an existing widget (`iris-button` is the simplest reference). At minimum:

1. `widgets/<name>/package.json` — copy an existing widget's, updating `name`, `widgetName`, `mxpackage`, and `description`. Keep `packagePath: "com.iris.widgets"` for consistency. Keep `react`/`react-dom`/`@types/react`/`@types/react-dom` as **peerDependencies** (not devDependencies) — see [Troubleshooting](#troubleshooting--known-gotchas).
2. `widgets/<name>/tsconfig.json`:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": { "noEmit": true, "declaration": false, "declarationMap": false },
     "include": ["src", "typings"]
   }
   ```
3. `widgets/<name>/.eslintrc.js`:
   ```js
   const base = require("@mendix/pluggable-widgets-tools/configs/eslint.ts.base.json");
   module.exports = { ...base };
   ```
4. `widgets/<name>/prettier.config.js`:
   ```js
   const base = require("@mendix/pluggable-widgets-tools/configs/prettier.base.json");
   module.exports = { ...base };
   ```
5. `widgets/<name>/src/<Name>.xml` (widget definition, `id="com.iris.widgets.<Name>"`) and `widgets/<name>/src/package.xml` (module descriptor listing the XML file — this is what makes typings auto-generate).
6. `widgets/<name>/src/<Name>.tsx` + `<Name>.editorPreview.tsx`.
7. Run `pnpm install` at the root, then `pnpm --filter <name> run build` once — this generates `widgets/<name>/typings/<Name>Props.d.ts` from your XML.
8. Add a demo to the Mock UI (see above) so the team can see/test it without Studio Pro.

`pnpm-workspace.yaml` already globs `widgets/*`, so a new widget folder is picked up automatically — no config changes needed there.

## Linting & formatting conventions

This is a deliberate split:

- **`shared/ax-common` and `mock-ui`** use the root `eslint.config.js` (flat config, ESLint 9) and root `.prettierrc`.
- **Every widget under `widgets/*`** self-lints and self-formats using `@mendix/pluggable-widgets-tools`' own bundled ESLint 8 (legacy config) and Prettier config — via `pnpm --filter <widget> run lint` / `lint:fix` / `format`. This matches how Mendix's own widget generator scaffolds things, and keeps each widget's tooling correct even if it's ever extracted into its own repo.

Because of this, root `eslint.config.js` and `.prettierignore` explicitly exclude `widgets/**` — don't remove that exclusion, or you'll get double-linted files with two different (and slightly incompatible) rule sets fighting each other.

## Troubleshooting / known gotchas

A few non-obvious things that took real debugging to work out — worth knowing before you go down the same path again:

- **`react`/`@types/react` must be peerDependencies, not devDependencies, on widgets.** `@mendix/pluggable-widgets-tools` has a one-time "dependency migration" check that force-removes `react`, `react-dom`, `@types/react`, `@types/react-dom` if it finds them as regular dependencies (it expects them as peers, satisfied by whatever hosts the widget). Declaring them as optional peers lets pnpm still resolve real types for local dev (satisfied by `mock-ui`'s own dependencies) without triggering that removal.
- **The `mendix` npm package is types-only.** Its actual JS deliberately throws if executed (`"This package should not be used in the runtime..."`) — at real Mendix runtime, Studio Pro substitutes its own implementation. Widget source code can (and does, e.g. in AxMultiSelect) legitimately import runtime values like `ValueStatus` from `"mendix"`. Since Vite has no such substitution, `mock-ui/vite.config.ts` aliases `"mendix"` to `mock-ui/src/mocks/mendixRuntimeShim.ts` for the browser bundle only — types still resolve to the real package.
- **Keep the `mendix` package version consistent across every package mock-ui imports from.** It's types-only, but each resolved version produces a nominally distinct `DynamicValue`/`ValueStatus`/etc. Two different versions (even structurally identical) will fail to type-check against each other once mock-ui imports both. All widgets + mock-ui are pinned to the same `mendix` version for this reason — don't let a new widget drift to a different one.
- **Never build/lint a widget without `CI=true`** (already baked into every widget's npm scripts via `cross-env CI=true ...`) — without it, `pluggable-widgets-tools` can prompt interactively ("Update dependencies? (Yes/no)") when it detects what it considers outdated deps, which hangs indefinitely in a non-interactive shell/CI.
- **`config.projectPath`, `mxpackage`, and `testProject` must be present in a widget's `package.json`**, even if empty/unused — `pluggable-widgets-tools build:web` crashes with a raw `TypeError` if `config` is missing entirely.
- **A widget's `src/package.xml` is required**, not optional — it's what the typings generator reads to know which XML file(s) to turn into `typings/*Props.d.ts`.
