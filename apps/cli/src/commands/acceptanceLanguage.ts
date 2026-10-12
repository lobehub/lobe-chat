import { resolveServerUrl } from '../settings';
import { log } from '../utils/logger';

/**
 * Acceptance pages are read by the account owner, so every human-readable
 * field has to be in their reply language. Agents get this wrong when they
 * infer "the user's language" from a delegation prompt instead of the
 * conversation, and a rule in the skill alone cannot stop that — so the CLI
 * checks the text before anything is published.
 *
 * Only scripts that are unambiguous against Latin are enforced: a Chinese
 * field with no Han character is certainly wrong, while English vs Portuguese
 * cannot be told apart reliably by script.
 */
interface ScriptRule {
  /** Shown in errors: "must be written in Chinese". */
  languageName: string;
  /** Matches at least one character of the target writing system. */
  pattern: RegExp;
}

const HAN = { languageName: 'Chinese', pattern: /\p{Script=Han}/u } satisfies ScriptRule;
const CYRILLIC = { languageName: 'Cyrillic script', pattern: /\p{Script=Cyrillic}/u };
const ARABIC = { languageName: 'Arabic script', pattern: /\p{Script=Arabic}/u };

/** Keyed by the primary language subtag of `responseLanguage` (`zh-CN` → `zh`). */
const SCRIPT_RULES: Record<string, ScriptRule> = {
  ar: { ...ARABIC, languageName: 'Arabic' },
  be: CYRILLIC,
  bg: { ...CYRILLIC, languageName: 'Bulgarian' },
  el: { languageName: 'Greek', pattern: /\p{Script=Greek}/u },
  fa: { ...ARABIC, languageName: 'Persian' },
  he: { languageName: 'Hebrew', pattern: /\p{Script=Hebrew}/u },
  hi: { languageName: 'Hindi', pattern: /\p{Script=Devanagari}/u },
  ja: {
    languageName: 'Japanese',
    pattern: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u,
  },
  kk: CYRILLIC,
  ko: { languageName: 'Korean', pattern: /\p{Script=Hangul}/u },
  mn: CYRILLIC,
  ru: { ...CYRILLIC, languageName: 'Russian' },
  sr: CYRILLIC,
  th: { languageName: 'Thai', pattern: /\p{Script=Thai}/u },
  uk: { ...CYRILLIC, languageName: 'Ukrainian' },
  zh: HAN,
};

export type ReportLanguage =
  | { locale: string; rule: ScriptRule; status: 'enforced' }
  /** A Latin-script language: set, but not distinguishable by script. */
  | { locale: string; status: 'unchecked' }
  /** "Follow system" in Settings stores nothing the server can read. */
  | { status: 'unset' };

export interface LanguageField {
  path: string;
  text: unknown;
}

interface UserStateClient {
  user: { getUserState: { query: () => Promise<unknown> } };
}

export const responseLanguageSettingsUrl = () => {
  const url = new URL('/settings/appearance', resolveServerUrl());
  // The server URL may embed credentials; this link is printed to logs.
  url.username = '';
  url.password = '';
  return url.toString();
};

export function reportLanguageFor(responseLanguage: string | undefined): ReportLanguage {
  const locale = responseLanguage?.trim();
  if (!locale) return { status: 'unset' };
  const rule = SCRIPT_RULES[locale.split(/[-_]/)[0]!.toLowerCase()];
  return rule ? { locale, rule, status: 'enforced' } : { locale, status: 'unchecked' };
}

export async function resolveReportLanguage(client: UserStateClient): Promise<ReportLanguage> {
  const state = (await client.user.getUserState.query()) as {
    settings?: { general?: { responseLanguage?: unknown } };
  };
  const value = state?.settings?.general?.responseLanguage;
  return reportLanguageFor(typeof value === 'string' ? value : undefined);
}

/**
 * Code, links and paths are legitimately English inside any report; strip them
 * so "修复了 `useFoo` 的问题" passes and a bare `npm test` field is judged on
 * nothing rather than on the identifier.
 */
const stripNonProse = (text: string) =>
  text
    .replaceAll(/(```|~~~)[\s\S]*?\1/g, ' ')
    .replaceAll(/`[^`\n]*`/g, ' ')
    .replaceAll(/!?\[[^\]]*\]\([^)]*\)/g, (match) => match.replace(/\([^)]*\)$/, ''))
    // A URL may contain non-ASCII path segments (`/中文`, `/café`), so it runs to
    // whitespace — but stops at full-width punctuation, which never belongs to a
    // URL and is how Chinese prose usually continues after one.
    .replaceAll(/https?:\/\/[^\s<>"'`，。！？、；：（）【】「」《》]+/g, ' ');

/**
 * A field fails when it contains letters but none in the target script — the
 * whole field is in another language. Mixed text with identifiers passes.
 */
export function findLanguageViolations(fields: LanguageField[], rule: ScriptRule) {
  return fields.flatMap((field) => {
    if (typeof field.text !== 'string') return [];
    const prose = stripNonProse(field.text);
    if (!/\p{L}/u.test(prose) || rule.pattern.test(prose)) return [];
    return [{ path: field.path, text: field.text }];
  });
}

interface IngestTextInput {
  cases: { case: Record<string, any>; checkItemId: string }[];
  conclusion?: string;
  goal?: string;
  plan?: {
    definition?: unknown;
    description?: string;
    id: string;
    title: string;
    verifierConfig?: unknown;
  }[];
  proposal?: string;
  report?: string;
  requirement?: string;
  title?: unknown;
}

/** Prose in a check definition: its outcome, preconditions and step wording. */
function checkDefinitionFields(at: string, definition: unknown): LanguageField[] {
  const value = (definition ?? {}) as {
    expected?: unknown;
    preconditions?: unknown;
    steps?: unknown;
  };
  const preconditions = Array.isArray(value.preconditions) ? value.preconditions : [];
  const steps = Array.isArray(value.steps) ? value.steps : [];
  return [
    { path: `${at}.expected`, text: value.expected },
    ...preconditions.map((text: unknown, index: number) => ({
      path: `${at}.preconditions[${index}]`,
      text,
    })),
    ...steps.flatMap((step: any) => [
      { path: `${at}.steps[${String(step?.id)}].instruction`, text: step?.instruction },
      { path: `${at}.steps[${String(step?.id)}].expected`, text: step?.expected },
    ]),
  ];
}

/** Every `ingest` field that renders as prose on the acceptance page. */
export function ingestLanguageFields(input: IngestTextInput): LanguageField[] {
  const fields: LanguageField[] = [
    { path: 'title', text: input.title },
    { path: 'focus', text: input.goal },
    { path: 'requirement', text: input.requirement },
    { path: 'summary.conclusion', text: input.conclusion },
    { path: 'report.md', text: input.report },
    { path: 'proposal.md', text: input.proposal },
  ];
  for (const item of input.plan ?? []) {
    const config = (item.verifierConfig ?? {}) as { expected?: unknown; method?: unknown };
    fields.push(
      { path: `plan[${item.id}].title`, text: item.title },
      { path: `plan[${item.id}].method`, text: config.method },
      { path: `plan[${item.id}].expected`, text: config.expected },
      { path: `plan[${item.id}].description`, text: item.description },
      ...checkDefinitionFields(`plan[${item.id}].definition`, item.definition),
    );
  }
  for (const { case: c, checkItemId } of input.cases) {
    fields.push(
      { path: `cases[${checkItemId}].name`, text: c.name ?? c.case ?? c.title },
      {
        path: `cases[${checkItemId}].observation`,
        text: c.keyObservation ?? c.observation ?? c.note,
      },
      { path: `cases[${checkItemId}].suggestion`, text: c.suggestion },
    );
    const evidence = Array.isArray(c.evidence) ? c.evidence : [c.evidence];
    evidence.forEach((entry: any, index: number) => {
      if (!entry || typeof entry !== 'object') return;
      fields.push({
        path: `cases[${checkItemId}].evidence[${index}].description`,
        text: entry.description ?? entry.desc,
      });
    });
  }
  return fields;
}

const preview = (text: string) => {
  const line = text.replaceAll(/\s+/g, ' ').trim();
  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
};

export class ReportLanguageError extends Error {
  constructor(
    readonly locale: string,
    readonly violations: { path: string; text: string }[],
    languageName: string,
  ) {
    super(
      [
        `Report language check failed: your account's response language (settings.general.responseLanguage) is "${locale}", so every human-readable field must be written in ${languageName}.`,
        `These ${violations.length} field(s) contain no ${languageName} text:`,
        ...violations.map((v) => `  - ${v.path}: "${preview(v.text)}"`),
        `Rewrite them in ${languageName} and retry. If "${locale}" is not the language you read, change Response Language at ${responseLanguageSettingsUrl()} first.`,
      ].join('\n'),
    );
    this.name = 'ReportLanguageError';
  }
}

export const unsetLanguageWarning = () =>
  `Report language not checked: your account has no response language set (Response Language is "Follow System" at ${responseLanguageSettingsUrl()}). Set it so acceptance text is checked against the language you read.`;

/**
 * Throws `ReportLanguageError` before any remote write when a field is in the
 * wrong script. There is intentionally no bypass flag: an agent that hits the
 * error would just add it.
 */
export async function assertReportLanguage(
  client: UserStateClient,
  fields: LanguageField[],
  language?: ReportLanguage,
): Promise<ReportLanguage> {
  const resolved = language ?? (await resolveReportLanguage(client));
  if (resolved.status === 'unset') {
    log.warn(unsetLanguageWarning());
    return resolved;
  }
  if (resolved.status !== 'enforced') return resolved;
  const violations = findLanguageViolations(fields, resolved.rule);
  if (violations.length > 0) {
    throw new ReportLanguageError(resolved.locale, violations, resolved.rule.languageName);
  }
  return resolved;
}

/** JSON-safe view of the resolved language for `--json` output. */
export const languageSummary = (language: ReportLanguage) => ({
  enforced: language.status === 'enforced',
  locale: language.status === 'unset' ? null : language.locale,
  ...(language.status === 'enforced' ? { languageName: language.rule.languageName } : {}),
  status: language.status,
});

/** Prose in a flow definition: its title and every inline check's wording. */
export function flowLanguageFields(definition: unknown): LanguageField[] {
  const flow = (definition ?? {}) as { nodes?: unknown; title?: unknown };
  const fields: LanguageField[] = [{ path: 'definition.title', text: flow.title }];
  const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
  for (const node of nodes) {
    const check = (node as { check?: any })?.check;
    if (!check || typeof check !== 'object') continue;
    const at = `nodes[${String(check.id ?? (node as { id?: unknown }).id)}].check`;
    fields.push(
      { path: `${at}.title`, text: check.title },
      { path: `${at}.description`, text: check.description },
      ...checkDefinitionFields(`${at}.definition`, check.definition),
    );
  }
  return fields;
}
