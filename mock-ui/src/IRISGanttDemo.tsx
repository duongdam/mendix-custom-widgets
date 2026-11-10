import { useEffect, useMemo, useRef, useState } from "react";
import Big from "big.js";
import type { ObjectItem, Option } from "mendix";

import { IRISGantt } from "../../widgets/iris-gantt/src/IRISGantt";
import type { PrpScaleEnum } from "../../widgets/iris-gantt/typings/IRISGanttProps";
import { createListAttributeValue, createListValue } from "./mocks/mendixMocks";
import {
    GANTT_SIZES,
    generateGanttData,
    MockGanttLink,
    MockGanttTask,
} from "./mocks/ganttFixtures";

/** Simulated round trip of the "On Task Change" microflow (commit + datasource refresh). */
const MICROFLOW_DELAY_MS = 300;

type TaskItem = ObjectItem & MockGanttTask;
type LinkItem = ObjectItem & MockGanttLink;

// Mock ActionValue whose variables match whichever action prop it is passed to.
function action<T>(fn: (args: T) => void): never {
    return { canExecute: true, isExecuting: false, execute: fn } as unknown as never;
}

/** Re-orders the new parent's children so the moved task lands at `index`. */
function moveTask(
    tasks: MockGanttTask[],
    id: string,
    parentId: string,
    index: number,
): MockGanttTask[] {
    const moved = tasks.find((t) => t.taskId === id);
    if (!moved) {
        return tasks;
    }
    const siblings = tasks
        .filter((t) => t.parentId === parentId && t.taskId !== id)
        .sort((a, b) => a.order - b.order);
    siblings.splice(index, 0, { ...moved, parentId });
    const newOrder = new Map(siblings.map((t, i) => [t.taskId, i]));
    return tasks.map((t) =>
        newOrder.has(t.taskId)
            ? {
                  ...t,
                  parentId: t.taskId === id ? parentId : t.parentId,
                  order: newOrder.get(t.taskId)!,
              }
            : t,
    );
}

export function IRISGanttDemo() {
    const [sizeIndex, setSizeIndex] = useState(1);
    const initial = useMemo(() => generateGanttData(GANTT_SIZES[1]!), []);
    const [tasks, setTasks] = useState<MockGanttTask[]>(initial.tasks);
    const [links, setLinks] = useState<MockGanttLink[]>(initial.links);
    const [rejectEdits, setRejectEdits] = useState(false);
    const [scale] = useState<PrpScaleEnum>("week");
    const [log, setLog] = useState<string[]>([]);
    const [renderMs, setRenderMs] = useState<number | undefined>();
    // Lazy initializer: runs once, before the first (10k) render — the initial measurement.
    const [mountedAt] = useState(() => performance.now());
    const renderStartRef = useRef<number | undefined>(undefined);
    const linkSeqRef = useRef(0);

    const addLog = (line: string) => setLog((entries) => [line, ...entries].slice(0, 6));

    const changeSize = (index: number) => {
        const data = generateGanttData(GANTT_SIZES[index]!);
        renderStartRef.current = performance.now();
        setSizeIndex(index);
        setTasks(data.tasks);
        setLinks(data.links);
    };

    // Child effects (the widget's parse) run before this one — so this measures map + parse,
    // and the rAF adds the first paint.
    useEffect(() => {
        const startedAt =
            renderStartRef.current ?? (renderMs === undefined ? mountedAt : undefined);
        if (startedAt === undefined) {
            return;
        }
        renderStartRef.current = undefined;
        requestAnimationFrame(() => setRenderMs(performance.now() - startedAt));
        // Only a new dataset should be measured — not the renderMs update itself.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]);

    const tasksValue = useMemo(() => createListValue(tasks), [tasks]);
    const linksValue = useMemo(() => createListValue(links), [links]);

    const attrs = useMemo(
        () => ({
            prpTaskIdAttr: createListAttributeValue<string | Big>(
                "mock.Id",
                (i) => (i as TaskItem).taskId,
            ),
            prpTaskParentIdAttr: createListAttributeValue<string | Big>(
                "mock.ParentId",
                (i) => (i as TaskItem).parentId,
            ),
            prpTaskTextAttr: createListAttributeValue<string>(
                "mock.Name",
                (i) => (i as TaskItem).name,
            ),
            prpTaskTypeAttr: createListAttributeValue<string>(
                "mock.Type",
                (i) => (i as TaskItem).type,
            ),
            prpTaskStartAttr: createListAttributeValue<Date>(
                "mock.Start",
                (i) => (i as TaskItem).start,
            ),
            prpTaskEndAttr: createListAttributeValue<Date>("mock.End", (i) => (i as TaskItem).end),
            prpTaskProgressAttr: createListAttributeValue<Big>(
                "mock.Progress",
                (i) => new Big((i as TaskItem).progress),
            ),
            prpTaskOrderAttr: createListAttributeValue<Big>(
                "mock.Order",
                (i) => new Big((i as TaskItem).order),
            ),
            prpTaskColorAttr: createListAttributeValue<string>(
                "mock.Color",
                (i) => (i as TaskItem).color,
            ),
            prpLinkIdAttr: createListAttributeValue<string | Big>(
                "mock.LinkId",
                (i) => (i as LinkItem).linkId,
            ),
            prpLinkSourceAttr: createListAttributeValue<string | Big>(
                "mock.Source",
                (i) => (i as LinkItem).source,
            ),
            prpLinkTargetAttr: createListAttributeValue<string | Big>(
                "mock.Target",
                (i) => (i as LinkItem).target,
            ),
            prpLinkTypeAttr: createListAttributeValue<string>(
                "mock.LinkType",
                (i) => (i as LinkItem).type,
            ),
        }),
        [],
    );

    const actions = useMemo(
        () => ({
            prpOnTaskChange: action(
                (v: {
                    taskId: Option<string>;
                    startDate: Option<Date>;
                    endDate: Option<Date>;
                    progress: Option<Big>;
                    parentId: Option<string>;
                    sortOrder: Option<Big>;
                }) => {
                    const summary = `${v.taskId}: ${v.startDate?.toLocaleDateString()} → ${v.endDate?.toLocaleDateString()}, ${v.progress?.toString()}%, parent ${v.parentId ?? "—"} #${v.sortOrder?.toString()}`;
                    window.setTimeout(() => {
                        if (rejectEdits) {
                            addLog(`✗ rejected ${summary}`);
                            return;
                        }
                        addLog(`✓ saved ${summary}`);
                        setTasks((current) => {
                            const moved = current.find((t) => t.taskId === v.taskId);
                            let next = current;
                            if (
                                moved &&
                                (moved.parentId !== (v.parentId ?? "") ||
                                    moved.order !== Number(v.sortOrder))
                            ) {
                                next = moveTask(
                                    current,
                                    v.taskId!,
                                    v.parentId ?? "",
                                    Number(v.sortOrder ?? 0),
                                );
                            }
                            return next.map((t) =>
                                t.taskId === v.taskId
                                    ? {
                                          ...t,
                                          start: v.startDate ?? t.start,
                                          end: v.endDate ?? t.end,
                                          progress: Number(v.progress ?? t.progress),
                                      }
                                    : t,
                            );
                        });
                    }, MICROFLOW_DELAY_MS);
                },
            ),
            prpOnLinkCreate: action(
                (v: {
                    sourceId: Option<string>;
                    targetId: Option<string>;
                    linkType: Option<string>;
                }) => {
                    window.setTimeout(() => {
                        if (rejectEdits) {
                            addLog(`✗ rejected link ${v.sourceId} → ${v.targetId}`);
                            return;
                        }
                        addLog(`✓ link ${v.sourceId} → ${v.targetId} (${v.linkType})`);
                        setLinks((current) => [
                            ...current,
                            {
                                linkId: `new-${++linkSeqRef.current}`,
                                source: v.sourceId!,
                                target: v.targetId!,
                                type: v.linkType ?? "FS",
                            },
                        ]);
                    }, MICROFLOW_DELAY_MS);
                },
            ),
            prpOnLinkDelete: action((v: { linkId: Option<string> }) => {
                window.setTimeout(() => {
                    if (rejectEdits) {
                        addLog(`✗ rejected delete of ${v.linkId}`);
                        return;
                    }
                    addLog(`✓ deleted link ${v.linkId}`);
                    setLinks((current) => current.filter((l) => l.linkId !== v.linkId));
                }, MICROFLOW_DELAY_MS);
            }),
            prpOnTaskClick: action((v: { taskId: Option<string> }) => addLog(`click ${v.taskId}`)),
            prpOnTaskDoubleClick: action((v: { taskId: Option<string> }) =>
                addLog(`double click ${v.taskId} (open popup)`),
            ),
        }),
        [rejectEdits],
    );

    return (
        <section>
            <h2>IRISGantt</h2>
            <div className="app__controls">
                <label>
                    Dataset{" "}
                    <select value={sizeIndex} onChange={(e) => changeSize(Number(e.target.value))}>
                        {GANTT_SIZES.map((size, index) => (
                            <option key={size.label} value={index}>
                                {size.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={rejectEdits}
                        onChange={(e) => setRejectEdits(e.target.checked)}
                    />{" "}
                    Microflow rejects edits
                </label>
                <span>
                    Rows: <code>{tasks.length.toLocaleString()}</code> · Links:{" "}
                    <code>{links.length.toLocaleString()}</code> · Map + parse + paint:{" "}
                    <code>{renderMs === undefined ? "…" : `${renderMs.toFixed(0)} ms`}</code>
                </span>
            </div>

            <IRISGantt
                name="iris-gantt-demo"
                class=""
                prpTasks={tasksValue}
                {...attrs}
                prpSummaryTypes="block,group"
                prpTypeHierarchy="block>group>task"
                prpOpenLevel={1}
                prpLinks={linksValue}
                prpAllowDragMove
                prpAllowResize
                prpAllowProgressDrag
                prpAllowReorder
                prpAllowLinkEdit
                {...actions}
                prpScale={scale}
                prpDurationUnit="day"
                prpShowToolbar
                prpLocale="en"
                prpHeight="560px"
                prpShowStartColumn
                prpShowDurationColumn
                prpShowProgress
                prpLogPerformance
            />

            <table className="app__log-table">
                <tbody>
                    {log.map((line, index) => (
                        <tr key={index}>
                            <td>{line}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
