import { CSSProperties, ReactElement, useCallback, useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Gantt, type GanttStatic, type Link, type Task } from "dhtmlx-gantt";
import classNames from "classnames";

import { GanttStore } from "../store/GanttStore";
import { GanttLinkRecord, GanttScale, GanttTaskRecord, LinkCreate, TaskChange } from "../types/GanttTypes";
import { diffRecords, Snapshot } from "../utils/diff";
import { canDropUnder, parseHierarchy } from "../utils/hierarchy";
import { linkSignature, taskSignature, taskStructureSignature, toLinkTypeName } from "../utils/mapping";
import { scalesFor } from "../utils/scales";
import { GanttToolbar } from "./GanttToolbar";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

export interface GanttViewConfig {
    typeHierarchy: string;
    openLevel: number;
    durationUnit: "day" | "hour";
    locale: string;
    height: string;
    gridWidth: number;
    rowHeight: number;
    showStartColumn: boolean;
    showDurationColumn: boolean;
    showProgress: boolean;
    showToolbar: boolean;
    allowDragMove: boolean;
    allowResize: boolean;
    allowProgressDrag: boolean;
    allowReorder: boolean;
    allowLinkEdit: boolean;
    logPerformance: boolean;
}

export interface GanttViewProps {
    className?: string;
    style?: CSSProperties;
    store: GanttStore;
    tasks: GanttTaskRecord[];
    links: GanttLinkRecord[];
    loading: boolean;
    editPending: boolean;
    config: GanttViewConfig;
    onTaskChange: (change: TaskChange) => void;
    onLinkCreate: (link: LinkCreate) => void;
    onLinkDelete: (linkId: string) => void;
    onTaskClick: (taskId: string) => void;
    onTaskDoubleClick: (taskId: string) => void;
}

const ROOT_ID = 0;
/** Above this share of changed rows a full re-parse is cheaper than per-task updates. */
const FULL_PARSE_RATIO = 0.2;
/** How long an optimistic edit may wait for fresh data before it is snapped back. */
const REVERT_AFTER_MS = 2000;

interface IrisTask extends Task {
    irisType: string;
}

function toDhtmlxTask(record: GanttTaskRecord, open: boolean): IrisTask {
    return {
        id: record.id,
        parent: record.parent || ROOT_ID,
        text: record.text,
        type: record.summary ? "project" : "task",
        irisType: record.irisType,
        // Copies: DHTMLX mutates task dates in place while dragging.
        start_date: new Date(record.start.getTime()),
        ...(record.end ? { end_date: new Date(record.end.getTime()) } : { duration: record.duration ?? 1 }),
        progress: record.progress / 100,
        color: record.color,
        readonly: record.readonly,
        open
    } as IrisTask;
}

function toDhtmlxLink(record: GanttLinkRecord): Link {
    return { id: record.id, source: record.source, target: record.target, type: record.type } as Link;
}

/** Applies a changed record onto the existing DHTMLX task object, without re-creating it. */
function updateTaskInPlace(gantt: GanttStatic, record: GanttTaskRecord): void {
    if (!gantt.isTaskExists(record.id)) {
        return;
    }
    const task = gantt.getTask(record.id) as IrisTask;
    task.text = record.text;
    task.type = record.summary ? "project" : "task";
    task.irisType = record.irisType;
    task.progress = record.progress / 100;
    task.color = record.color;
    task.readonly = record.readonly;
    // Summary dates are derived from children by DHTMLX itself.
    if (!record.summary) {
        task.start_date = new Date(record.start.getTime());
        if (record.end) {
            task.end_date = new Date(record.end.getTime());
            task.duration = gantt.calculateDuration({ start_date: task.start_date, end_date: task.end_date, task });
        } else {
            task.duration = record.duration ?? 1;
            task.end_date = gantt.calculateEndDate({ start_date: task.start_date, duration: task.duration, task });
        }
    }
    gantt.updateTask(record.id);
}

function applyConfig(gantt: GanttStatic, config: GanttViewConfig, scale: GanttScale): void {
    const { scales, minColumnWidth } = scalesFor(scale);
    const c = gantt.config;

    // --- Performance: the settings that matter for ~10k rows ---
    c.smart_rendering = true; // only rows/bars inside the viewport exist in the DOM
    c.static_background = true; // PRO: grid background drawn as an image instead of cells
    c.show_errors = false;
    c.auto_types = false;
    c.sort = false;
    c.fit_tasks = false;
    c.drag_project = false;
    c.details_on_dblclick = false;
    c.details_on_create = false;
    c.show_tasks_outside_timescale = false;

    c.root_id = ROOT_ID;
    c.duration_unit = config.durationUnit;
    c.row_height = config.rowHeight;
    c.bar_height = Math.max(12, config.rowHeight - 12);
    c.grid_width = config.gridWidth;
    c.scales = scales;
    c.min_column_width = minColumnWidth;
    c.show_progress = config.showProgress;

    c.drag_move = config.allowDragMove;
    c.drag_resize = config.allowResize;
    c.drag_progress = config.allowProgressDrag && config.showProgress;
    c.drag_links = config.allowLinkEdit;
    // "marker" mode moves a placeholder while dragging instead of re-rendering the tree on every
    // mouse move — the only practical row-drag mode for large trees.
    c.order_branch = config.allowReorder ? "marker" : false;
    c.order_branch_free = config.allowReorder;

    c.columns = [
        { name: "text", tree: true, width: "*", min_width: 160, resize: true },
        ...(config.showStartColumn ? [{ name: "start_date", align: "center", width: 112, resize: true }] : []),
        ...(config.showDurationColumn ? [{ name: "duration", align: "center", width: 72 }] : [])
    ];

    try {
        gantt.i18n.setLocale(config.locale || "en");
    } catch {
        gantt.i18n.setLocale("en");
    }
}

function GanttViewComponent(props: GanttViewProps): ReactElement {
    const { store, tasks, links, config } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const ganttRef = useRef<GanttStatic | undefined>(undefined);

    // Latest props for DHTMLX event handlers, which are attached once at init.
    const propsRef = useRef(props);
    useEffect(() => {
        propsRef.current = props;
    });

    const hierarchy = useMemo(() => parseHierarchy(config.typeHierarchy), [config.typeHierarchy]);
    const hierarchyRef = useRef(hierarchy);
    useEffect(() => {
        hierarchyRef.current = hierarchy;
    }, [hierarchy]);

    // Sync bookkeeping — refs, not state: none of it should cause a React render.
    const syncingRef = useRef(false); // true while *we* mutate the chart → ignore its events
    const taskSnapshotRef = useRef(new Map<string, Snapshot>());
    const linkSnapshotRef = useRef(new Map<string, Snapshot>());
    const pendingTaskIdsRef = useRef(new Set<string>()); // edited by the user, awaiting new data
    const pendingStructureRef = useRef(false); // a row was re-ordered/re-parented locally
    const tempLinkIdsRef = useRef(new Set<string>()); // links drawn by the user (client ids)
    const deletedLinkIdsRef = useRef(new Set<string>()); // links deleted by the user
    const revertTimerRef = useRef<number | undefined>(undefined);

    const log = useCallback((label: string, startedAt: number, count: number) => {
        if (propsRef.current.config.logPerformance) {
            console.info(`[IRISGantt] ${label}: ${count} records in ${(performance.now() - startedAt).toFixed(1)} ms`);
        }
    }, []);

    // --- Data: diff the incoming records into DHTMLX ---
    const applyData = useCallback(
        (nextTasks: GanttTaskRecord[], nextLinks: GanttLinkRecord[]) => {
            const gantt = ganttRef.current;
            if (!gantt) {
                return;
            }
            const startedAt = performance.now();
            // While an edit's microflow still runs, keep the optimistic chart state.
            const settle = !propsRef.current.editPending;
            const force = settle ? pendingTaskIdsRef.current : new Set<string>();

            const firstLoad = taskSnapshotRef.current.size === 0;
            const { diff, snapshot } = diffRecords(
                taskSnapshotRef.current,
                nextTasks,
                taskSignature,
                taskStructureSignature,
                force
            );
            const structural =
                diff.added.length > 0 ||
                diff.removed.length > 0 ||
                diff.moved.length > 0 ||
                (settle && pendingStructureRef.current);
            const tooMany = diff.updated.length > nextTasks.length * FULL_PARSE_RATIO;

            syncingRef.current = true;
            try {
                if (firstLoad || structural || tooMany) {
                    // Re-parse everything, but keep what the user was looking at.
                    const openIds = new Set<string>();
                    if (!firstLoad) {
                        gantt.eachTask((task: Task) => {
                            if (task.$open) {
                                openIds.add(String(task.id));
                            }
                        });
                    }
                    const scroll = firstLoad ? undefined : gantt.getScrollState();
                    const known = taskSnapshotRef.current;
                    const { openLevel } = propsRef.current.config;
                    gantt.clearAll();
                    gantt.parse({
                        data: nextTasks.map(record =>
                            toDhtmlxTask(
                                record,
                                known.has(record.id) ? openIds.has(record.id) : record.depth < openLevel
                            )
                        ),
                        links: nextLinks.map(toDhtmlxLink)
                    });
                    if (scroll) {
                        gantt.scrollTo(scroll.x, scroll.y);
                    }
                    linkSnapshotRef.current = diffRecords(
                        new Map(),
                        nextLinks,
                        linkSignature,
                        () => "",
                        new Set()
                    ).snapshot;
                    tempLinkIdsRef.current.clear();
                    deletedLinkIdsRef.current.clear();
                    log(firstLoad ? "initial parse" : "full re-parse", startedAt, nextTasks.length);
                } else {
                    const linkResult = diffRecords(
                        linkSnapshotRef.current,
                        nextLinks,
                        linkSignature,
                        () => "",
                        new Set()
                    );
                    gantt.batchUpdate(() => {
                        for (const record of diff.updated) {
                            updateTaskInPlace(gantt, record);
                        }
                        // Links: incremental always — they have no hierarchy to keep consistent.
                        if (settle) {
                            for (const id of tempLinkIdsRef.current) {
                                if (gantt.isLinkExists(id) && !linkResult.snapshot.has(id)) {
                                    gantt.deleteLink(id);
                                }
                            }
                            tempLinkIdsRef.current.clear();
                        }
                        for (const id of linkResult.diff.removed) {
                            if (gantt.isLinkExists(id)) {
                                gantt.deleteLink(id);
                            }
                        }
                        for (const record of linkResult.diff.updated) {
                            if (gantt.isLinkExists(record.id)) {
                                gantt.deleteLink(record.id);
                            }
                            gantt.addLink(toDhtmlxLink(record));
                        }
                        for (const record of linkResult.diff.added) {
                            if (!gantt.isLinkExists(record.id)) {
                                gantt.addLink(toDhtmlxLink(record));
                            }
                        }
                        // Deleted in the chart but still in the data → the delete was rejected.
                        if (settle) {
                            for (const id of deletedLinkIdsRef.current) {
                                const record = nextLinks.find(link => link.id === id);
                                if (record && !gantt.isLinkExists(id)) {
                                    gantt.addLink(toDhtmlxLink(record));
                                }
                            }
                            deletedLinkIdsRef.current.clear();
                        }
                    });
                    linkSnapshotRef.current = linkResult.snapshot;
                    if (diff.updated.length > 0) {
                        log("incremental update", startedAt, diff.updated.length);
                    }
                }
            } finally {
                syncingRef.current = false;
            }

            taskSnapshotRef.current = snapshot;
            if (settle) {
                pendingTaskIdsRef.current = new Set();
                pendingStructureRef.current = false;
            }
        },
        [log]
    );

    const latestDataRef = useRef({ tasks, links });
    useEffect(() => {
        latestDataRef.current = { tasks, links };
    }, [tasks, links]);

    /** After an edit: if no fresh data shows up in time, the change was rejected → snap back. */
    const scheduleRevertCheck = useCallback(() => {
        window.clearTimeout(revertTimerRef.current);
        revertTimerRef.current = window.setTimeout(function check() {
            if (propsRef.current.editPending) {
                revertTimerRef.current = window.setTimeout(check, REVERT_AFTER_MS);
                return;
            }
            applyData(latestDataRef.current.tasks, latestDataRef.current.links);
        }, REVERT_AFTER_MS);
    }, [applyData]);

    // --- Init once: DHTMLX owns this DOM subtree; React never re-renders into it ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const gantt = Gantt.getGanttInstance();
        gantt.plugins({ tooltip: true });
        applyConfig(gantt, propsRef.current.config, store.scale);

        gantt.templates.task_class = (_start: Date, _end: Date, task: Task) =>
            `iris-gantt-type-${(task as IrisTask).irisType}`;
        gantt.templates.grid_row_class = (_start: Date, _end: Date, task: Task) =>
            `iris-gantt-row-${(task as IrisTask).irisType}`;

        const emitTaskChange = (id: string | number): void => {
            const task = gantt.getTask(id);
            pendingTaskIdsRef.current.add(String(id));
            propsRef.current.onTaskChange({
                taskId: String(id),
                startDate: new Date(task.start_date!.getTime()),
                endDate: new Date(task.end_date!.getTime()),
                progress: (task.progress ?? 0) * 100,
                parentId: task.parent === ROOT_ID ? undefined : String(task.parent),
                sortOrder: gantt.getTaskIndex(id)
            });
            scheduleRevertCheck();
        };

        const typeOf = (id: string | number): string =>
            id === ROOT_ID || id === "" || !gantt.isTaskExists(id) ? "" : (gantt.getTask(id) as IrisTask).irisType;

        gantt.attachEvent("onTaskClick", (id: string | number) => {
            if (id !== null && id !== undefined) {
                propsRef.current.onTaskClick(String(id));
            }
            return true;
        });
        gantt.attachEvent("onTaskDblClick", (id: string | number) => {
            if (id !== null && id !== undefined) {
                propsRef.current.onTaskDoubleClick(String(id));
            }
            return false; // never open DHTMLX's built-in lightbox
        });
        gantt.attachEvent("onAfterTaskDrag", (id: string | number) => emitTaskChange(id));

        // Row drag: only allow drops the Type Hierarchy permits (block > group > task).
        const validDrop = (id: string | number, parent: string | number): boolean =>
            canDropUnder(hierarchyRef.current, typeOf(id), typeOf(parent));
        gantt.attachEvent("onBeforeRowDragMove", (id: string | number, parent: string | number) =>
            validDrop(id, parent)
        );
        gantt.attachEvent("onBeforeRowDragEnd", (id: string | number) => validDrop(id, gantt.getTask(id).parent!));
        // Only report a row drop that actually moved the row (a click-and-release is not a move).
        let rowDragOrigin: { parent: string | number; index: number } | undefined;
        gantt.attachEvent("onRowDragStart", (id: string | number) => {
            rowDragOrigin = { parent: gantt.getTask(id).parent!, index: gantt.getTaskIndex(id) };
            return true;
        });
        gantt.attachEvent("onRowDragEnd", (id: string | number) => {
            const task = gantt.getTask(id);
            const moved =
                !rowDragOrigin ||
                rowDragOrigin.parent !== task.parent ||
                rowDragOrigin.index !== gantt.getTaskIndex(id);
            rowDragOrigin = undefined;
            if (moved) {
                pendingStructureRef.current = true;
                emitTaskChange(id);
            }
        });

        gantt.attachEvent("onAfterLinkAdd", (id: string | number, link: Link) => {
            if (syncingRef.current) {
                return;
            }
            tempLinkIdsRef.current.add(String(id));
            propsRef.current.onLinkCreate({
                sourceId: String(link.source),
                targetId: String(link.target),
                linkType: toLinkTypeName(link.type)
            });
            scheduleRevertCheck();
        });
        gantt.attachEvent("onAfterLinkDelete", (id: string | number) => {
            if (syncingRef.current) {
                return;
            }
            deletedLinkIdsRef.current.add(String(id));
            propsRef.current.onLinkDelete(String(id));
            scheduleRevertCheck();
        });

        gantt.init(container);
        ganttRef.current = gantt;
        applyData(latestDataRef.current.tasks, latestDataRef.current.links);

        return () => {
            window.clearTimeout(revertTimerRef.current);
            gantt.destructor();
            ganttRef.current = undefined;
            taskSnapshotRef.current = new Map();
            linkSnapshotRef.current = new Map();
        };
        // Deliberately once per mount — later config/data changes go through the effects below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Config / scale changes: reconfigure + one render, data untouched ---
    const { scale } = store;
    const isFirstConfig = useRef(true);
    useEffect(() => {
        if (isFirstConfig.current) {
            isFirstConfig.current = false;
            return;
        }
        const gantt = ganttRef.current;
        if (gantt) {
            applyConfig(gantt, config, scale);
            gantt.render();
        }
        // `config` is a fresh object every render — compare its fields instead.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale, ...Object.values(config)]);

    // --- Data changes ---
    const isFirstData = useRef(true);
    useEffect(() => {
        if (isFirstData.current) {
            isFirstData.current = false; // the init effect already applied the first data
            return;
        }
        window.clearTimeout(revertTimerRef.current);
        applyData(tasks, links);
    }, [tasks, links, applyData]);

    const handleExpandAll = useCallback(
        (open: boolean) => {
            const gantt = ganttRef.current;
            if (!gantt) {
                return;
            }
            const startedAt = performance.now();
            gantt.eachTask((task: Task) => {
                task.$open = open;
            });
            gantt.render();
            log(open ? "expand all" : "collapse all", startedAt, gantt.getTaskCount());
        },
        [log]
    );

    const handleToday = useCallback(() => ganttRef.current?.showDate(new Date()), []);

    return (
        <div className={classNames("iris-gantt", props.className)} style={props.style}>
            {config.showToolbar && (
                <GanttToolbar
                    store={store}
                    onExpandAll={() => handleExpandAll(true)}
                    onCollapseAll={() => handleExpandAll(false)}
                    onToday={handleToday}
                />
            )}
            <div className="iris-gantt__chart" style={{ height: config.height }}>
                <div ref={containerRef} className="iris-gantt__container" />
                {props.loading && <div className="iris-gantt__loading">Loading…</div>}
            </div>
        </div>
    );
}

export const GanttView = observer(GanttViewComponent);
