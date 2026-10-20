const STYLE_PROPS = [
  'display',
  'position',
  'flexDirection',
  'flexWrap',
  'alignItems',
  'justifyContent',
  'gap',
  'gridTemplateColumns',
  'overflow',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'color',
  'backgroundColor',
  'backgroundImage',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'whiteSpace',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopStyle',
  'borderTopColor',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'boxShadow',
  'opacity',
  'cursor',
  'transition',
] as const;

type StyleProp = (typeof STYLE_PROPS)[number];

export interface StyleSnapshotEntry {
  box: string;
  key: string;
  label: string;
  style: Record<StyleProp, string>;
}

export interface StyleSnapshotDiff {
  added?: true;
  box?: [string, string];
  changed?: Partial<Record<StyleProp, [string, string]>>;
  key: string;
  label: string;
  removed?: true;
}

// Boxes are relative to the root so a recentered modal or a scrolled page does
// not register as a change.
export const captureStyles = (root: Element): StyleSnapshotEntry[] => {
  const origin = root.getBoundingClientRect();
  const entries: StyleSnapshotEntry[] = [];

  const visit = (element: Element, key: string) => {
    const computed = getComputedStyle(element);
    if (computed.display === 'none') return;

    const rect = element.getBoundingClientRect();
    entries.push({
      box: [rect.x - origin.x, rect.y - origin.y, rect.width, rect.height]
        .map((n) => Math.round(n))
        .join(','),
      key,
      label: `${element.tagName}:${(element.textContent ?? '').trim().slice(0, 24)}`,
      style: Object.fromEntries(STYLE_PROPS.map((prop) => [prop, computed[prop]])) as Record<
        StyleProp,
        string
      >,
    });
    [...element.children].forEach((child, index) => visit(child, `${key}.${index}`));
  };

  [...root.children].forEach((child, index) => visit(child, String(index)));
  return entries;
};

export const diffStyleSnapshots = (
  before: StyleSnapshotEntry[],
  after: StyleSnapshotEntry[],
): StyleSnapshotDiff[] => {
  const afterByKey = new Map(after.map((entry) => [entry.key, entry]));
  const beforeKeys = new Set(before.map((entry) => entry.key));
  const diffs: StyleSnapshotDiff[] = [];

  for (const prev of before) {
    const next = afterByKey.get(prev.key);
    if (!next) {
      diffs.push({ key: prev.key, label: prev.label, removed: true });
      continue;
    }
    const changed: StyleSnapshotDiff['changed'] = {};
    for (const prop of STYLE_PROPS) {
      if (prev.style[prop] !== next.style[prop])
        changed[prop] = [prev.style[prop], next.style[prop]];
    }
    const boxChanged = prev.box !== next.box;
    if (boxChanged || Object.keys(changed).length > 0)
      diffs.push({
        ...(boxChanged && { box: [prev.box, next.box] as [string, string] }),
        ...(Object.keys(changed).length > 0 && { changed }),
        key: prev.key,
        label: prev.label,
      });
  }

  for (const next of after) {
    if (!beforeKeys.has(next.key)) diffs.push({ added: true, key: next.key, label: next.label });
  }

  return diffs;
};

export interface PackedSnapshot {
  rows: [key: string, label: string, box: string, style: number][];
  styles: string[];
}

const STYLE_SEPARATOR = '\u0001';

// localStorage holds ~5 MB per origin; most elements share one computed style.
export const packSnapshot = (entries: StyleSnapshotEntry[]): PackedSnapshot => {
  const styles: string[] = [];
  const ids = new Map<string, number>();
  const rows = entries.map(({ box, key, label, style }): PackedSnapshot['rows'][number] => {
    const packed = STYLE_PROPS.map((prop) => style[prop]).join(STYLE_SEPARATOR);
    let id = ids.get(packed);
    if (id === undefined) {
      id = styles.length;
      styles.push(packed);
      ids.set(packed, id);
    }
    return [key, label, box, id];
  });
  return { rows, styles };
};

export const unpackSnapshot = ({ rows, styles }: PackedSnapshot): StyleSnapshotEntry[] =>
  rows.map(([key, label, box, id]) => {
    const values = styles[id].split(STYLE_SEPARATOR);
    return {
      box,
      key,
      label,
      style: Object.fromEntries(STYLE_PROPS.map((prop, index) => [prop, values[index]])) as Record<
        StyleProp,
        string
      >,
    };
  });
