import type { GoalGraphView } from '../goalGraphViewModel';
import { BATCH_FRAME_HEAD } from './batchLayout';
import type { BatchModel } from './batchModel';
import { type LayoutBox, NODE_HEIGHT, NODE_WIDTH } from './layout';
import type { MeasuredSizes } from './measuredSizes';

/**
 * A batch entered on its own: every unit as a card, grouped by the round it
 * ran in. A batch is dozens of units that do not lead to one another, so a
 * tree lays them out as one endless row; here each round is a frame, top to
 * bottom — the cold start first — with its plan and gate on the left and its
 * units in a grid beside them:
 *
 *   ┆冷启动: ▢ ▢ ▢ ▢ / ▢ ▢┆
 *   ┆第 1 轮: 方案 v1 · 闸门 │ ▢ ▢ ▢ ▢ / ▢ ▢ ▢ ▢ …┆
 *   ┆第 2 轮: 方案 v2 · 闸门 │ ▢ ▢┆
 */

export const BATCH_SCOPE_COLUMNS = 4;
const PAD = 16;
const GAP = 16;
const SECTION_GAP = 32;
const HEADER_WIDTH = 250;
const HEADER_GAP = 32;

export interface BatchScopeFrame {
  box: LayoutBox;
  id: string;
  /** 0 for the cold start, else the round's revision. */
  revision: number;
}

export interface BatchScopeLayout {
  boxes: Record<string, LayoutBox>;
  /** Plan → gate inside each round, the only links the grid draws. */
  edges: { id: string; source: string; target: string }[];
  frames: BatchScopeFrame[];
}

export const batchScopeFrameId = (batchId: string, revision: number) =>
  `${batchId}::scope-${revision}`;

/**
 * `nodeIds`: the members on the map. A member the rounds do not account for
 * (a side decision without a subject, a unit of an unknown wave) joins the
 * latest round, so nothing in the batch drops off the map.
 */
export const layoutBatchScope = (
  graph: GoalGraphView,
  model: BatchModel,
  nodeIds: ReadonlySet<string>,
  sizes: MeasuredSizes = {},
): BatchScopeLayout => {
  const placed = new Set<string>();
  const take = (ids: (string | undefined)[]) =>
    ids.filter((id): id is string => {
      if (!id || !nodeIds.has(id) || placed.has(id)) return false;
      placed.add(id);
      return true;
    });

  const [first] = model.rounds;
  const sections: { headers: string[]; revision: number; units: string[] }[] = [];
  if (first.probes.length)
    sections.push({
      headers: [],
      revision: 0,
      units: take(first.probes.map((probe) => probe.nodeId)),
    });
  for (const round of model.rounds) {
    const headers = take([round.templateId, round.assayId]);
    const units = take([
      ...(round.revision > 1 ? round.probes.map((probe) => probe.nodeId) : []),
      ...model.waves.flatMap((cells, wave) =>
        model.waveRounds[wave] === round.revision ? cells.map((cell) => cell.nodeId) : [],
      ),
    ]);
    sections.push({ headers, revision: round.revision, units });
  }
  // Side decisions sit with the units of the round their subject ran in.
  const sectionOf = new Map<string, (typeof sections)[number]>();
  for (const section of sections) for (const id of section.units) sectionOf.set(id, section);
  const latest = sections.at(-1)!;
  for (const id of model.decisionIds) {
    const subject = graph.byId[id]?.gateSubjectId;
    const [taken] = take([id]);
    if (taken) (subject ? (sectionOf.get(subject) ?? latest) : latest).units.push(taken);
  }
  latest.units.push(...take([...nodeIds]));

  const kindOf = (id: string) => graph.byId[id]?.node.kind ?? 'task';
  const widthOf = (id: string) => sizes[id]?.width ?? NODE_WIDTH[kindOf(id)];
  const heightOf = (id: string) => sizes[id]?.height ?? NODE_HEIGHT[kindOf(id)];

  const cell = Math.max(NODE_WIDTH.task, ...[...placed].map(widthOf));
  const gridWidth = BATCH_SCOPE_COLUMNS * cell + (BATCH_SCOPE_COLUMNS - 1) * GAP;
  const hasHeaders = sections.some((section) => section.headers.length);
  const gridX = PAD + (hasHeaders ? HEADER_WIDTH + HEADER_GAP : 0);
  const frameWidth = gridX + gridWidth + PAD;

  const boxes: Record<string, LayoutBox> = {};
  const frames: BatchScopeFrame[] = [];
  const edges: BatchScopeLayout['edges'] = [];
  let top = 0;
  for (const section of sections) {
    if (!section.headers.length && !section.units.length) continue;
    const bodyTop = top + BATCH_FRAME_HEAD;

    let headerBottom = bodyTop;
    section.headers.forEach((id, index) => {
      boxes[id] = { height: heightOf(id), width: HEADER_WIDTH, x: PAD, y: headerBottom };
      headerBottom += heightOf(id) + GAP;
      const above = section.headers[index - 1];
      if (above) edges.push({ id: `${model.batchId}::scope-e-${id}`, source: above, target: id });
    });

    let rowTop = bodyTop;
    for (let start = 0; start < section.units.length; start += BATCH_SCOPE_COLUMNS) {
      const row = section.units.slice(start, start + BATCH_SCOPE_COLUMNS);
      row.forEach((id, column) => {
        boxes[id] = {
          height: heightOf(id),
          width: widthOf(id),
          x: gridX + column * (cell + GAP),
          y: rowTop,
        };
      });
      rowTop += Math.max(...row.map(heightOf)) + GAP;
    }

    const bottom = Math.max(headerBottom, rowTop) - GAP + PAD;
    const id = batchScopeFrameId(model.batchId, section.revision);
    const box = { height: bottom - top, width: frameWidth, x: 0, y: top };
    frames.push({ box, id, revision: section.revision });
    boxes[id] = box;
    top = bottom + SECTION_GAP;
  }

  return { boxes, edges, frames };
};
