import { ReactElement, useCallback, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { ValueStatus } from "mendix";
import Big from "big.js";

import { IRISGanttContainerProps } from "../../typings/IRISGanttProps";
import { GanttStore } from "../store/GanttStore";
import { GanttLinkRecord, GanttTaskRecord, LinkCreate, TaskChange } from "../types/GanttTypes";
import { finalizeTasks, parseTypeList, toDhtmlxLinkType } from "../utils/mapping";
import { GanttView } from "./GanttView";

export interface GanttSyncProps extends IRISGanttContainerProps {
    store: GanttStore;
}

const EMPTY_TASKS: GanttTaskRecord[] = [];
const EMPTY_LINKS: GanttLinkRecord[] = [];

function toNumber(value: Big | undefined): number | undefined {
    return value === undefined ? undefined : Number(value.toString());
}

function logTiming(enabled: boolean, label: string, startedAt: number, count: number): void {
    if (enabled) {
        console.info(`[IRISGantt] ${label}: ${count} records in ${(performance.now() - startedAt).toFixed(1)} ms`);
    }
}

function GanttSyncComponent(props: GanttSyncProps): ReactElement {
    const { store, tasks, links, logPerformance } = props;
    const summaryTypes = useMemo(() => parseTypeList(props.summaryTypes), [props.summaryTypes]);

    // --- Tasks: Mendix datasource -> plain records (one pass over up to ~10k items) ---
    const mappedTasks = useMemo<GanttTaskRecord[] | undefined>(() => {
        if (tasks.status !== ValueStatus.Available || !tasks.items) {
            return undefined;
        }
        // Diagnostics only (Log Performance) — the timestamp never affects what is rendered.
        // eslint-disable-next-line react-hooks/purity
        const startedAt = performance.now();
        const { taskIdAttr, taskParentIdAttr, taskTextAttr, taskTypeAttr, taskStartAttr, taskEndAttr } = props;
        const { taskDurationAttr, taskProgressAttr, taskOrderAttr, taskColorAttr, taskReadOnlyAttr } = props;

        const raw = [];
        for (let index = 0; index < tasks.items.length; index++) {
            const item = tasks.items[index]!;
            const id = taskIdAttr.get(item).value;
            const start = taskStartAttr.get(item).value;
            if (id === undefined || id === "" || !start) {
                continue;
            }
            const irisType = (taskTypeAttr?.get(item).value ?? "task").toLowerCase();
            const parent = taskParentIdAttr?.get(item).value;
            raw.push({
                id: String(id),
                parent: parent === undefined ? "" : String(parent),
                text: taskTextAttr.get(item).value ?? "",
                irisType,
                summary: summaryTypes.has(irisType),
                start,
                end: taskEndAttr?.get(item).value,
                duration: toNumber(taskDurationAttr?.get(item).value),
                progress: toNumber(taskProgressAttr?.get(item).value) ?? 0,
                order: toNumber(taskOrderAttr?.get(item).value) ?? index,
                color: taskColorAttr?.get(item).value || undefined,
                readonly: taskReadOnlyAttr?.get(item).value === true
            });
        }
        const records = finalizeTasks(raw);
        logTiming(logPerformance, "map tasks", startedAt, records.length);
        return records;
        // Attribute props are stable per page; the ListValue identity changes on every reload.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, summaryTypes, logPerformance]);

    const mappedLinks = useMemo<GanttLinkRecord[] | undefined>(() => {
        if (!links) {
            return EMPTY_LINKS;
        }
        if (links.status !== ValueStatus.Available || !links.items) {
            return undefined;
        }
        // Diagnostics only (Log Performance) — the timestamp never affects what is rendered.
        // eslint-disable-next-line react-hooks/purity
        const startedAt = performance.now();
        const { linkIdAttr, linkSourceAttr, linkTargetAttr, linkTypeAttr } = props;
        const records: GanttLinkRecord[] = [];
        for (const item of links.items) {
            const id = linkIdAttr?.get(item).value;
            const source = linkSourceAttr?.get(item).value;
            const target = linkTargetAttr?.get(item).value;
            if (id === undefined || source === undefined || target === undefined) {
                continue;
            }
            records.push({
                id: String(id),
                source: String(source),
                target: String(target),
                type: toDhtmlxLinkType(linkTypeAttr?.get(item).value)
            });
        }
        logTiming(logPerformance, "map links", startedAt, records.length);
        return records;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [links, logPerformance]);

    // While a datasource reloads, keep handing the previous records to the view so the chart
    // never flashes empty ("adjust state during render" pattern — no effect, no extra commit).
    const [taskRecords, setTaskRecords] = useState<GanttTaskRecord[]>(EMPTY_TASKS);
    const [linkRecords, setLinkRecords] = useState<GanttLinkRecord[]>(EMPTY_LINKS);
    if (mappedTasks && mappedTasks !== taskRecords) {
        setTaskRecords(mappedTasks);
    }
    if (mappedLinks && mappedLinks !== linkRecords) {
        setLinkRecords(mappedLinks);
    }

    // --- Chart events -> Mendix actions (the widget never writes the task objects itself) ---
    const { onTaskChange, onLinkCreate, onLinkDelete, onTaskClick, onTaskDoubleClick, selectedTaskIdAttr } = props;

    const handleTaskChange = useCallback(
        (change: TaskChange) => {
            if (onTaskChange?.canExecute) {
                onTaskChange.execute({
                    taskId: change.taskId,
                    startDate: change.startDate,
                    endDate: change.endDate,
                    progress: new Big(change.progress.toFixed(2)),
                    parentId: change.parentId,
                    sortOrder: new Big(change.sortOrder)
                });
            }
        },
        [onTaskChange]
    );

    const handleLinkCreate = useCallback(
        (link: LinkCreate) => {
            if (onLinkCreate?.canExecute) {
                onLinkCreate.execute(link);
            }
        },
        [onLinkCreate]
    );

    const handleLinkDelete = useCallback(
        (linkId: string) => {
            if (onLinkDelete?.canExecute) {
                onLinkDelete.execute({ linkId });
            }
        },
        [onLinkDelete]
    );

    const handleTaskClick = useCallback(
        (taskId: string) => {
            store.setSelectedTaskId(taskId);
            if (selectedTaskIdAttr && !selectedTaskIdAttr.readOnly) {
                selectedTaskIdAttr.setValue(taskId);
            }
            if (onTaskClick?.canExecute) {
                onTaskClick.execute({ taskId });
            }
        },
        [store, selectedTaskIdAttr, onTaskClick]
    );

    const handleTaskDoubleClick = useCallback(
        (taskId: string) => {
            if (onTaskDoubleClick?.canExecute) {
                onTaskDoubleClick.execute({ taskId });
            }
        },
        [onTaskDoubleClick]
    );

    return (
        <GanttView
            className={props.class}
            style={props.style}
            store={store}
            tasks={mappedTasks ?? taskRecords}
            links={mappedLinks ?? linkRecords}
            loading={tasks.status === ValueStatus.Loading && taskRecords.length === 0}
            // An edit is still "in flight" until its microflow finishes — until then the view keeps
            // the optimistic position instead of snapping back to the (not yet updated) data.
            editPending={onTaskChange?.isExecuting === true || onLinkCreate?.isExecuting === true}
            config={{
                typeHierarchy: props.typeHierarchy,
                openLevel: props.openLevel,
                durationUnit: props.durationUnit,
                locale: props.locale,
                height: props.height,
                gridWidth: props.gridWidth,
                rowHeight: props.rowHeight,
                showStartColumn: props.showStartColumn,
                showDurationColumn: props.showDurationColumn,
                showProgress: props.showProgress,
                showToolbar: props.showToolbar,
                allowDragMove: props.allowDragMove && !!onTaskChange,
                allowResize: props.allowResize && !!onTaskChange,
                allowProgressDrag: props.allowProgressDrag && !!onTaskChange,
                allowReorder: props.allowReorder && !!onTaskChange,
                allowLinkEdit: props.allowLinkEdit && (!!onLinkCreate || !!onLinkDelete),
                logPerformance
            }}
            onTaskChange={handleTaskChange}
            onLinkCreate={handleLinkCreate}
            onLinkDelete={handleLinkDelete}
            onTaskClick={handleTaskClick}
            onTaskDoubleClick={handleTaskDoubleClick}
        />
    );
}

export const GanttSync = observer(GanttSyncComponent);
