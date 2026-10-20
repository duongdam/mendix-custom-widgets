// Field names avoid `id`: createListValue() overwrites `id` with the mock ObjectItem id.
export interface MockGanttTask {
    taskId: string;
    parentId: string;
    name: string;
    type: "block" | "group" | "task";
    start: Date;
    end: Date;
    progress: number;
    order: number;
    color?: string;
}

export interface MockGanttLink {
    linkId: string;
    source: string;
    target: string;
    type: string;
}

export interface GanttDatasetSize {
    label: string;
    blocks: number;
    groupsPerBlock: number;
    tasksPerGroup: number;
}

export const GANTT_SIZES: GanttDatasetSize[] = [
    { label: "~1,000 tasks", blocks: 5, groupsPerBlock: 10, tasksPerGroup: 20 },
    { label: "~10,000 tasks", blocks: 20, groupsPerBlock: 10, tasksPerGroup: 50 },
    { label: "~20,000 tasks", blocks: 40, groupsPerBlock: 10, tasksPerGroup: 50 },
];

const DAY = 24 * 60 * 60 * 1000;

// Small deterministic PRNG so every dataset size renders the same plan on each reload.
function random(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

/** Block > Group > Task plan with finish-to-start links between consecutive tasks of a group. */
export function generateGanttData(size: GanttDatasetSize): {
    tasks: MockGanttTask[];
    links: MockGanttLink[];
} {
    const rand = random(42);
    const origin = new Date();
    origin.setHours(0, 0, 0, 0);
    origin.setTime(origin.getTime() - 60 * DAY);

    const tasks: MockGanttTask[] = [];
    const links: MockGanttLink[] = [];

    for (let b = 1; b <= size.blocks; b++) {
        const blockId = `B${b}`;
        const blockStart = origin.getTime() + (b - 1) * 14 * DAY;
        tasks.push({
            taskId: blockId,
            parentId: "",
            name: `Block ${b}`,
            type: "block",
            start: new Date(blockStart),
            end: new Date(blockStart + DAY),
            progress: 0,
            order: b,
        });
        for (let g = 1; g <= size.groupsPerBlock; g++) {
            const groupId = `${blockId}-G${g}`;
            let cursor = blockStart + Math.floor(rand() * 30) * DAY;
            tasks.push({
                taskId: groupId,
                parentId: blockId,
                name: `Group ${b}.${g}`,
                type: "group",
                start: new Date(cursor),
                end: new Date(cursor + DAY),
                progress: 0,
                order: g,
            });
            let previousId: string | undefined;
            for (let t = 1; t <= size.tasksPerGroup; t++) {
                const taskId = `${groupId}-T${t}`;
                const duration = (1 + Math.floor(rand() * 8)) * DAY;
                const start = cursor + Math.floor(rand() * 2) * DAY;
                tasks.push({
                    taskId,
                    parentId: groupId,
                    name: `Task ${b}.${g}.${t}`,
                    type: "task",
                    start: new Date(start),
                    end: new Date(start + duration),
                    progress: Math.round(rand() * 100),
                    order: t,
                    color: rand() < 0.05 ? "#fa8c16" : undefined,
                });
                if (previousId) {
                    links.push({
                        linkId: `L-${previousId}-${taskId}`,
                        source: previousId,
                        target: taskId,
                        type: "FS",
                    });
                }
                previousId = taskId;
                cursor = start + duration;
            }
        }
    }
    return { tasks, links };
}
