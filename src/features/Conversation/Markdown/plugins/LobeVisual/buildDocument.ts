import { type VisualBlock, type VisualTone } from './schema';

/** Theme colors the generated document is painted with, taken from the app theme. */
export interface VisualPalette {
  border: string;
  colorScheme: 'dark' | 'light';
  error: string;
  fill: string;
  fontFamily: string; // lobe-design-ignore LOBE-FONT-FAMILY: carries theme.fontFamily into the isolated iframe document
  primary: string;
  /** Large surface radius; inner elements derive theirs from it. */
  radius: number;
  success: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  warning: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const toneVar: Record<VisualTone, string> = {
  negative: 'var(--error)',
  neutral: 'var(--text)',
  positive: 'var(--success)',
  primary: 'var(--primary)',
  warning: 'var(--warning)',
};

const SERIES_COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--error)'];

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));

const renderStats = (block: Extract<VisualBlock, { type: 'stats' }>) => `
<div class="stats count-${Math.min(block.items.length, 5)}">${block.items
  .map(
    (item) => `
  <div class="card" style="--tone:${toneVar[item.tone ?? 'neutral']}">
    <div class="label">${escapeHtml(item.label)}</div>
    <div class="value">${escapeHtml(item.value)}</div>
    ${item.note ? `<div class="note">${escapeHtml(item.note)}</div>` : ''}
  </div>`,
  )
  .join('')}
</div>`;

const renderBars = (block: Extract<VisualBlock, { type: 'bars' }>) => {
  const max = block.max ?? Math.max(...block.items.map((item) => item.value), 0);
  const unit = block.unit ?? '';
  return `
<div class="panel bars">${block.items
    .map((item) => {
      const ratio = max > 0 ? Math.min(Math.max(item.value / max, 0), 1) : 0;
      const shown = item.display ?? `${formatNumber(item.value)}${unit}`;
      return `
  <div class="bar-row${item.highlight ? ' highlight' : ''}">
    <div class="bar-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${(ratio * 100).toFixed(1)}%"></div></div>
    <div class="bar-value">${escapeHtml(shown)}</div>
  </div>`;
    })
    .join('')}
</div>`;
};

const renderCompare = (block: Extract<VisualBlock, { type: 'compare' }>) => {
  const columns = block.columns.map((column) =>
    typeof column === 'string' ? { name: column, note: undefined } : column,
  );
  const head = columns
    .map(
      (column) =>
        `<th><div class="col-name">${escapeHtml(column.name)}</div>${
          column.note ? `<div class="note">${escapeHtml(column.note)}</div>` : ''
        }</th>`,
    )
    .join('');
  const rows = block.rows
    .map(
      (row) =>
        `<tr><td class="row-label">${escapeHtml(row.label)}</td>${columns
          .map(
            (_, index) =>
              `<td${row.best === index ? ' class="best"' : ''}>${escapeHtml(row.values[index] ?? '')}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('');
  return `<table class="compare"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
};

const renderSteps = (block: Extract<VisualBlock, { type: 'steps' }>) => {
  const direction = block.direction ?? (block.items.length <= 5 ? 'horizontal' : 'vertical');
  return `
<ol class="steps ${direction}">${block.items
    .map(
      (item, index) => `
  <li class="step">
    <div class="step-index">${index + 1}</div>
    <div class="step-body">
      <div class="step-title">${escapeHtml(item.title)}</div>
      ${item.desc ? `<div class="note">${escapeHtml(item.desc)}</div>` : ''}
    </div>
  </li>`,
    )
    .join('')}
</ol>`;
};

const renderTimeline = (block: Extract<VisualBlock, { type: 'timeline' }>) => `
<div class="panel"><ol class="timeline">${block.items
  .map(
    (item) => `
  <li>
    <div class="time">${escapeHtml(item.time)}</div>
    <div class="step-title">${escapeHtml(item.title)}</div>
    ${item.desc ? `<div class="note">${escapeHtml(item.desc)}</div>` : ''}
  </li>`,
  )
  .join('')}
</ol></div>`;

const renderLine = (block: Extract<VisualBlock, { type: 'line' }>) => {
  const width = 600;
  const height = 180;
  const pad = 8;
  const values = block.series.flatMap((series) => series.values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (width - pad * 2) / (block.x.length - 1);
  const y = (value: number) => pad + (height - pad * 2) * (1 - (value - min) / span);
  const unit = block.unit ?? '';

  const lines = block.series
    .map((series, index) => {
      const points = series.values
        .slice(0, block.x.length)
        .map((value, i) => `${(pad + i * step).toFixed(1)},${y(value).toFixed(1)}`)
        .join(' ');
      return `<polyline points="${points}" fill="none" stroke="${SERIES_COLORS[index % SERIES_COLORS.length]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    })
    .join('');
  const legend = block.series
    .map(
      (series, index) =>
        `<span class="legend-item"><i style="background:${SERIES_COLORS[index % SERIES_COLORS.length]}"></i>${escapeHtml(series.name)}</span>`,
    )
    .join('');

  return `
<div class="panel line">
  <div class="line-scale"><span>${escapeHtml(formatNumber(max) + unit)}</span><span>${escapeHtml(formatNumber(min) + unit)}</span></div>
  <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img">${lines}</svg>
  <div class="line-x"><span>${escapeHtml(block.x[0])}</span><span>${escapeHtml(block.x.at(-1)!)}</span></div>
  ${block.series.length > 1 ? `<div class="legend">${legend}</div>` : ''}
</div>`;
};

const renderBody = (block: VisualBlock) => {
  switch (block.type) {
    case 'stats': {
      return renderStats(block);
    }
    case 'bars': {
      return renderBars(block);
    }
    case 'compare': {
      return renderCompare(block);
    }
    case 'steps': {
      return renderSteps(block);
    }
    case 'timeline': {
      return renderTimeline(block);
    }
    case 'line': {
      return renderLine(block);
    }
  }
};

const renderBlock = (block: VisualBlock) => `
<section class="block">
  ${block.tags?.length ? `<div class="tags">${block.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
  ${block.title ? `<div class="title">${escapeHtml(block.title)}</div>` : ''}
  ${renderBody(block)}
  ${block.caption ? `<div class="caption">${escapeHtml(block.caption)}</div>` : ''}
</section>`;

// The iframe document cannot inherit the page font, so the theme token is restated here.
const fontRule = (palette: VisualPalette) => `font-family: ${palette.fontFamily};`; // lobe-design-ignore LOBE-FONT-FAMILY: theme token restated inside the isolated iframe

const buildStyle = (palette: VisualPalette) => `
:root {
  color-scheme: ${palette.colorScheme};
  --text: ${palette.text};
  --text-2: ${palette.textSecondary};
  --text-3: ${palette.textTertiary};
  --border: ${palette.border};
  --fill: ${palette.fill};
  --primary: ${palette.primary};
  --success: ${palette.success};
  --warning: ${palette.warning};
  --error: ${palette.error};
  --radius: ${palette.radius}px;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: transparent; }
body { padding: 1px; ${fontRule(palette)} font-size: 13px; line-height: 1.6; color: var(--text); }
.block + .block { margin-top: 24px; }
.title { margin-bottom: 12px; font-size: 13px; font-weight: 600; }
.caption { margin-top: 12px; font-size: 12px; color: var(--text-3); }
.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.tag { padding: 2px 8px; border-radius: 999px; font-size: 12px; color: var(--success); background: color-mix(in srgb, var(--success) 12%, transparent); }
.note { font-size: 12px; line-height: 1.5; color: var(--text-3); }
.panel { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--fill); }
.stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
.stats.count-1 { grid-template-columns: minmax(0, 320px); }
.stats.count-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.stats.count-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.stats.count-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (min-width: 720px) { .stats.count-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 420px) { .stats.count-3 { grid-template-columns: minmax(0, 1fr); } }
.card { --tone: var(--text); display: flex; flex-direction: column; padding: 16px; border: 1px solid color-mix(in srgb, var(--tone) 14%, var(--border)); border-radius: var(--radius); background: linear-gradient(160deg, color-mix(in srgb, var(--tone) 8%, transparent), transparent 70%), var(--fill); }
.label { font-size: 12px; color: var(--text-2); }
.value { margin-top: 8px; font-size: 26px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; color: var(--tone); font-variant-numeric: tabular-nums; }
.card .note { margin-top: 8px; }
.bars { display: flex; flex-direction: column; gap: 12px; }
.bar-row { display: grid; grid-template-columns: minmax(72px, 28%) 1fr auto; gap: 12px; align-items: center; }
.bar-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--text-2); }
.bar-track { height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--text) 6%, transparent); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; background: var(--text-3); }
.bar-value { min-width: 48px; text-align: right; font-variant-numeric: tabular-nums; color: var(--text-2); }
.bar-row.highlight .bar-label, .bar-row.highlight .bar-value { color: var(--text); font-weight: 600; }
.bar-row.highlight .bar-fill { background: var(--primary); }
.compare { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.compare th, .compare td { padding: 12px 16px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--border); }
.compare thead th { background: var(--fill); font-weight: 600; }
.compare tr:last-child td { border-bottom: none; }
.compare .row-label { color: var(--text-2); white-space: nowrap; }
.compare td.best { color: var(--success); font-weight: 600; background: color-mix(in srgb, var(--success) 8%, transparent); }
.steps { list-style: none; margin: 0; padding: 0; display: flex; gap: 12px; }
.steps.vertical { flex-direction: column; }
.steps.horizontal > .step { flex: 1; min-width: 0; }
.step { display: flex; gap: 12px; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--fill); }
.step-index { flex: none; width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: 12px; font-weight: 600; color: var(--primary); background: color-mix(in srgb, var(--primary) 14%, transparent); }
.step-title { font-weight: 600; }
.step-body .note { margin-top: 4px; }
.timeline { list-style: none; margin: 0 0 0 8px; padding: 0 0 0 20px; border-left: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; }
.timeline li { position: relative; }
.timeline li::before { content: ''; position: absolute; left: -24.5px; top: 7px; width: 8px; height: 8px; border-radius: 999px; background: var(--primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent); }
.timeline .note { margin-top: 2px; }
.time { font-size: 12px; color: var(--text-3); font-variant-numeric: tabular-nums; }
.line svg { display: block; width: 100%; height: 160px; margin: 8px 0; }
.line-scale, .line-x { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-3); }
.legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 12px; color: var(--text-2); }
.legend-item { display: inline-flex; align-items: center; gap: 8px; }
.legend-item i { width: 12px; height: 3px; border-radius: 2px; }
@media (max-width: 480px) { .steps.horizontal { flex-direction: column; } }
`;

/** Build the complete HTML document mounted in the preview iframe. */
export const buildVisualDocument = (blocks: VisualBlock[], palette: VisualPalette) =>
  `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${buildStyle(palette)}</style>
</head>
<body>${blocks.map(renderBlock).join('')}</body>
</html>`;
