import { z } from 'zod';

/**
 * Inline visual DSL: the JSON body of a fenced `visual` code block.
 *
 * The model describes *what* to show (cards, bars, a comparison…) and the client
 * owns *how* it looks, so every block matches the chat theme and no model-written
 * markup or script reaches the page. The body is one block, an array of blocks,
 * or `{ "blocks": [...] }`.
 */

// Models often emit numbers where text is expected (e.g. `"value": 501`).
const text = z.union([z.string(), z.number()]).transform(String);
const optionalText = text.optional();
const num = z.coerce.number().refine(Number.isFinite);

const tone = z.enum(['neutral', 'primary', 'positive', 'negative', 'warning']);

const common = {
  /** Source or footnote line under the block. */
  caption: optionalText,
  /** Short pills above the block, e.g. a ranking badge. */
  tags: z.array(text).optional(),
  title: optionalText,
};

const statsBlock = z.object({
  ...common,
  items: z
    .array(
      z.object({
        label: text,
        note: optionalText,
        tone: tone.optional(),
        value: text,
      }),
    )
    .min(1),
  type: z.literal('stats'),
});

const barsBlock = z.object({
  ...common,
  items: z
    .array(
      z.object({
        /** Text shown instead of the raw number, e.g. "80.1%". */
        display: optionalText,
        highlight: z.boolean().optional(),
        label: text,
        value: num,
      }),
    )
    .min(1),
  /** Upper bound of the scale; defaults to the largest value. */
  max: num.optional(),
  type: z.literal('bars'),
  unit: optionalText,
});

const compareColumn = z.union([z.object({ name: text, note: optionalText }), text]);

const compareBlock = z.object({
  ...common,
  columns: z.array(compareColumn).min(2),
  rows: z
    .array(
      z.object({
        /** Index of the winning column, highlighted in that row. */
        best: z.number().int().optional(),
        label: text,
        values: z.array(text).min(1),
      }),
    )
    .min(1),
  type: z.literal('compare'),
});

const stepsBlock = z.object({
  ...common,
  direction: z.enum(['horizontal', 'vertical']).optional(),
  items: z.array(z.object({ desc: optionalText, title: text })).min(1),
  type: z.literal('steps'),
});

const timelineBlock = z.object({
  ...common,
  items: z.array(z.object({ desc: optionalText, time: text, title: text })).min(1),
  type: z.literal('timeline'),
});

const lineBlock = z.object({
  ...common,
  series: z.array(z.object({ name: text, values: z.array(num).min(1) })).min(1),
  type: z.literal('line'),
  unit: optionalText,
  x: z.array(text).min(2),
});

export const visualBlockSchema = z.discriminatedUnion('type', [
  statsBlock,
  barsBlock,
  compareBlock,
  stepsBlock,
  timelineBlock,
  lineBlock,
]);

export type VisualBlock = z.infer<typeof visualBlockSchema>;
export type VisualTone = z.infer<typeof tone>;

const documentSchema = z.union([
  visualBlockSchema.transform((block) => [block]),
  z.array(visualBlockSchema).min(1),
  z.object({ blocks: z.array(visualBlockSchema).min(1) }).transform(({ blocks }) => blocks),
]);

export type ParseVisualResult =
  { blocks: VisualBlock[]; success: true } | { error: string; success: false };

/** Parse a `visual` fence body. Never throws; a partial (streaming) body fails. */
export const parseVisual = (source: string): ParseVisualResult => {
  let json: unknown;
  try {
    json = JSON.parse(source);
  } catch (error) {
    return { error: (error as Error).message, success: false };
  }

  const result = documentSchema.safeParse(json);
  if (!result.success) return { error: result.error.message, success: false };

  return { blocks: result.data, success: true };
};
