import { describe, expect, it } from 'vitest';

import { buildVisualDocument, type VisualPalette } from './buildDocument';
import { parseVisual } from './schema';

const palette: VisualPalette = {
  border: '#eee',
  colorScheme: 'light',
  error: '#f00',
  fill: '#fafafa',
  fontFamily: 'system-ui',
  primary: '#1677ff',
  radius: 12,
  success: '#52c41a',
  text: '#000',
  textSecondary: '#555',
  textTertiary: '#999',
  warning: '#faad14',
};

const render = (source: unknown) => {
  const parsed = parseVisual(JSON.stringify(source));
  if (!parsed.success) throw new Error(parsed.error);
  return buildVisualDocument(parsed.blocks, palette);
};

describe('parseVisual', () => {
  it('accepts a single block, an array and a blocks wrapper', () => {
    const block = { items: [{ label: 'Params', value: '501B' }], type: 'stats' };

    for (const source of [block, [block, block], { blocks: [block] }]) {
      const parsed = parseVisual(JSON.stringify(source));
      expect(parsed.success).toBe(true);
    }
    expect(parseVisual(JSON.stringify([block, block]))).toMatchObject({
      blocks: [{ type: 'stats' }, { type: 'stats' }],
    });
  });

  it('fails on a partial streaming body instead of throwing', () => {
    expect(parseVisual('{"type":"stats","items":[{"label":"A"').success).toBe(false);
  });

  it('rejects unknown block types and empty item lists', () => {
    expect(parseVisual(JSON.stringify({ items: [], type: 'stats' })).success).toBe(false);
    expect(parseVisual(JSON.stringify({ type: 'pie' })).success).toBe(false);
  });

  it('coerces numeric strings in bar values', () => {
    const parsed = parseVisual(
      JSON.stringify({ items: [{ label: 'Beam', value: '80.1' }], type: 'bars' }),
    );
    expect(parsed).toMatchObject({ blocks: [{ items: [{ value: 80.1 }] }], success: true });
  });
});

describe('buildVisualDocument', () => {
  it('produces a complete document painted with the palette', () => {
    const html = render({ items: [{ label: 'Params', value: '501B' }], type: 'stats' });

    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('color-scheme: light');
    expect(html).toContain('--primary: #1677ff');
    expect(html).toContain('501B');
  });

  it('lays out four stats cards as a full grid instead of leaving an orphan card', () => {
    const items = ['A', 'B', 'C', 'D'].map((label) => ({ label, value: '1' }));

    expect(render({ items, type: 'stats' })).toContain('class="stats count-4"');
    expect(render({ items: items.slice(0, 3), type: 'stats' })).toContain('class="stats count-3"');
  });

  it('escapes model-provided text so no markup or script is injected', () => {
    const html = render({
      items: [{ label: '<img src=x onerror=alert(1)>', value: '<script>alert(1)</script>' }],
      title: '"quoted" & <b>',
      type: 'stats',
    });

    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&quot;quoted&quot; &amp; &lt;b&gt;');
  });

  it('scales bars against the largest value and highlights the marked row', () => {
    const html = render({
      items: [
        { label: 'Kimi', value: 88.3 },
        { display: '44.2%', highlight: true, label: 'Beam', value: 44.15 },
      ],
      type: 'bars',
    });

    expect(html).toContain('width:100.0%');
    expect(html).toContain('width:50.0%');
    expect(html).toContain('bar-row highlight');
    expect(html).toContain('44.2%');
  });

  it('marks the winning column of each comparison row', () => {
    const html = render({
      columns: ['iPhone', { name: 'Pixel', note: '$999' }],
      rows: [{ best: 1, label: 'Updates', values: ['5 years', '7 years'] }],
      type: 'compare',
    });

    expect(html).toContain('<td class="best">7 years</td>');
    expect(html).toContain('$999');
  });

  it('renders steps, a timeline and a line chart', () => {
    const html = render([
      { items: [{ title: 'DNS' }, { desc: '1 RTT', title: 'TCP' }], type: 'steps' },
      { items: [{ time: '10-05', title: 'Announced' }], type: 'timeline' },
      {
        series: [
          { name: 'A', values: [1, 3, 2] },
          { name: 'B', values: [2, 2, 4] },
        ],
        type: 'line',
        x: ['Mon', 'Tue', 'Wed'],
      },
    ]);

    expect(html).toContain('steps horizontal');
    expect(html).toContain('Announced');
    expect(html.match(/<polyline/g)).toHaveLength(2);
    expect(html).toContain('class="legend"');
  });
});

describe('artifacts index examples', () => {
  it('parses every visual DSL example the system prompt teaches', async () => {
    const { builtinSkills } = await import('@lobechat/builtin-skills');
    const index = builtinSkills.find((skill) => skill.name === 'artifacts')!.content;
    const examples = [...index.matchAll(/`(\{"type":.*?\})`/g)].map((match) => match[1]);

    expect(examples.length).toBeGreaterThanOrEqual(6);
    for (const example of examples) {
      expect(parseVisual(example), example).toMatchObject({ success: true });
    }
  });
});
