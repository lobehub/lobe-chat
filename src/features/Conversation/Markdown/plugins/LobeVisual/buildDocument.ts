import { type VisualBlock, type VisualTone } from './schema';

/** Theme colors the generated document is painted with, taken from the app theme. */
export interface VisualPalette {
  border: string;
  colorScheme: 'dark' | 'light';
  error: string;
  fill: string;
  fontFamily: string;
  primary: string;
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
<div class="stats">${block.items
  .map(
    (item) => `
  <div class="card">
    <div class="label">${escapeHtml(item.label)}</div>
    <div class="value" style="color:${toneVar[item.tone ?? 'neutral']}">${escapeHtml(item.value)}</div>
    ${item.note ? `<div class="note">${escapeHtml(item.note)}</div>` : ''}
  </div>`,
  )
  .join('')}
</div>`;

const renderBars = (block: Extract<VisualBlock, { type: 'bars' }>) => {
  const max = block.max ?? Math.max(...block.items.map((item) => item.value), 0);
  const unit = block.unit ?? '';
  return `
<div class="bars">${block.items
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
<ol class="timeline">${block.items
  .map(
    (item) => `
  <li>
    <div class="time">${escapeHtml(item.time)}</div>
    <div class="step-title">${escapeHtml(item.title)}</div>
    ${item.desc ? `<div class="note">${escapeHtml(item.desc)}</div>` : ''}
  </li>`,
  )
  .join('')}
</ol>`;

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
<div class="line">
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
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: transparent; }
body { font-family: ${palette.fontFamily}; font-size: 13px; line-height: 1.5; color: var(--text); }
.block + .block { margin-top: 16px; }
.title { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
.caption { margin-top: 8px; font-size: 12px; color: var(--text-3); }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.tag { padding: 1px 8px; border-radius: 999px; font-size: 12px; color: var(--success); background: color-mix(in srgb, var(--success) 14%, transparent); }
.note { font-size: 12px; color: var(--text-3); }
.stats { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
.card { padding: 10px 12px; border-radius: 10px; background: var(--fill); }
.label { font-size: 12px; color: var(--text-2); }
.value { margin: 2px 0; font-size: 22px; font-weight: 650; line-height: 1.3; font-variant-numeric: tabular-nums; }
.bars { display: flex; flex-direction: column; gap: 6px; }
.bar-row { display: grid; grid-template-columns: minmax(64px, 28%) 1fr auto; gap: 10px; align-items: center; }
.bar-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--text-2); }
.bar-track { height: 8px; border-radius: 999px; background: var(--fill); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; background: var(--text-3); }
.bar-value { min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; color: var(--text-2); }
.bar-row.highlight .bar-label, .bar-row.highlight .bar-value { color: var(--text); font-weight: 600; }
.bar-row.highlight .bar-fill { background: var(--primary); }
.compare { width: 100%; border-collapse: separate; border-spacing: 0; }
.compare th, .compare td { padding: 8px 10px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--border); }
.compare th { font-weight: 600; }
.compare tr:last-child td { border-bottom: none; }
.compare .row-label { color: var(--text-2); white-space: nowrap; }
.compare td.best { color: var(--success); font-weight: 600; background: color-mix(in srgb, var(--success) 10%, transparent); }
.col-name { font-size: 14px; }
.steps { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
.steps.vertical { flex-direction: column; }
.steps.horizontal > .step { flex: 1; min-width: 0; }
.step { display: flex; gap: 8px; padding: 10px; border-radius: 10px; background: var(--fill); }
.step-index { flex: none; width: 20px; height: 20px; border-radius: 999px; display: grid; place-items: center; font-size: 12px; font-weight: 600; color: var(--primary); background: color-mix(in srgb, var(--primary) 16%, transparent); }
.step-title { font-weight: 600; }
.timeline { list-style: none; margin: 0 0 0 5px; padding: 0 0 0 14px; border-left: 2px solid var(--border); display: flex; flex-direction: column; gap: 12px; }
.timeline li { position: relative; }
.timeline li::before { content: ''; position: absolute; left: -20px; top: 6px; width: 10px; height: 10px; border-radius: 999px; background: var(--primary); }
.time { font-size: 12px; color: var(--text-3); font-variant-numeric: tabular-nums; }
.line svg { display: block; width: 100%; height: 160px; }
.line-scale, .line-x { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-3); }
.legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; font-size: 12px; color: var(--text-2); }
.legend-item { display: inline-flex; align-items: center; gap: 6px; }
.legend-item i { width: 10px; height: 3px; border-radius: 2px; }
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
