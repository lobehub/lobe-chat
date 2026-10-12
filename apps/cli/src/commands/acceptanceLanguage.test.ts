import { afterEach, describe, expect, it, vi } from 'vitest';

import { log } from '../utils/logger';
import {
  assertReportLanguage,
  findLanguageViolations,
  flowLanguageFields,
  ingestLanguageFields,
  ReportLanguageError,
  reportLanguageFor,
} from './acceptanceLanguage';

vi.mock('../settings', () => ({
  resolveServerUrl: () => 'https://user:secret@app.lobehub.com',
}));

const clientFor = (responseLanguage?: string) => ({
  user: {
    getUserState: {
      query: vi.fn(async () => ({ settings: { general: { responseLanguage } } })),
    },
  },
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reportLanguageFor', () => {
  it('enforces scripts distinguishable from Latin', () => {
    expect(reportLanguageFor('zh-CN')).toMatchObject({ locale: 'zh-CN', status: 'enforced' });
    expect(reportLanguageFor('ja-JP')).toMatchObject({ status: 'enforced' });
    expect(reportLanguageFor('ru-RU')).toMatchObject({ status: 'enforced' });
  });

  it('does not script-check Latin languages', () => {
    expect(reportLanguageFor('en-US')).toEqual({ locale: 'en-US', status: 'unchecked' });
    expect(reportLanguageFor('pt-BR')).toEqual({ locale: 'pt-BR', status: 'unchecked' });
  });

  it('treats "Follow System" (empty or missing) as unset', () => {
    expect(reportLanguageFor('')).toEqual({ status: 'unset' });
    expect(reportLanguageFor(undefined)).toEqual({ status: 'unset' });
  });
});

describe('findLanguageViolations', () => {
  const zh = reportLanguageFor('zh-CN');
  const rule = zh.status === 'enforced' ? zh.rule : undefined!;

  it('flags a field with no character of the target script', () => {
    expect(
      findLanguageViolations([{ path: 'summary.conclusion', text: 'All checks passed.' }], rule),
    ).toEqual([{ path: 'summary.conclusion', text: 'All checks passed.' }]);
  });

  it('accepts target-language prose that mixes in identifiers, code and links', () => {
    expect(
      findLanguageViolations(
        [
          { path: 'a', text: '修复了 `useFoo` 在 Safari 下的问题' },
          { path: 'b', text: '```ts\nconst a = 1;\n```\n结论：通过' },
          { path: 'c', text: '见 [PR 页面](https://github.com/lobehub/lobehub/pull/1)' },
          { path: 'd', text: 'URL：https://example.com，页面已通过' },
        ],
        rule,
      ),
    ).toEqual([]);
  });

  it('ignores absent fields and fields with no prose at all', () => {
    expect(
      findLanguageViolations(
        [
          { path: 'a', text: undefined },
          { path: 'b', text: '`bun run check`' },
          { path: 'c', text: 'https://app.lobehub.com/acceptance/1' },
          { path: 'd', text: '200 / 200' },
          { path: 'e', text: '~~~ts\nconst retry = true;\n~~~' },
          { path: 'f', text: 'https://example.com/café' },
        ],
        rule,
      ),
    ).toEqual([]);
  });

  it('does not count target-script characters inside a URL as prose', () => {
    expect(
      findLanguageViolations(
        [{ path: 'a', text: 'All checks passed. https://example.com/中文' }],
        rule,
      ),
    ).toEqual([{ path: 'a', text: 'All checks passed. https://example.com/中文' }]);
  });

  it('accepts kana for Japanese', () => {
    const ja = reportLanguageFor('ja-JP');
    if (ja.status !== 'enforced') throw new Error('ja should be enforced');
    expect(findLanguageViolations([{ path: 'a', text: 'ボタンを押した' }], ja.rule)).toEqual([]);
  });
});

describe('assertReportLanguage', () => {
  it('names the configured language and every offending field', async () => {
    const error = await assertReportLanguage(clientFor('zh-CN'), [
      { path: 'title', text: '结账恢复' },
      { path: 'cases[screen].observation', text: 'The page showed the retry button.' },
    ]).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ReportLanguageError);
    const message = (error as Error).message;
    expect(message).toContain('response language (settings.general.responseLanguage) is "zh-CN"');
    expect(message).toContain('cases[screen].observation: "The page showed the retry button."');
    expect(message).not.toContain('title:');
    expect(message).toContain('https://app.lobehub.com/settings/appearance');
    expect(message).not.toContain('secret');
  });

  it('warns and skips the check when no response language is set', async () => {
    const warn = vi.spyOn(log, 'warn').mockImplementation(() => {});

    await expect(
      assertReportLanguage(clientFor(''), [{ path: 'title', text: 'English title' }]),
    ).resolves.toEqual({ status: 'unset' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no response language set'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('https://app.lobehub.com/settings/appearance'),
    );
  });
});

describe('flowLanguageFields', () => {
  it('collects the flow title and inline check wording', () => {
    const paths = flowLanguageFields({
      nodes: [
        {
          check: {
            definition: {
              expected: 'e',
              preconditions: ['p'],
              steps: [{ expected: 'se', id: 's1', instruction: 'i' }],
            },
            description: 'd',
            id: 'c1',
            title: 't',
          },
          id: 'n1',
        },
        { criterionId: 'existing', id: 'n2' },
      ],
      title: 'flow',
    }).map((field) => field.path);

    expect(paths).toEqual([
      'definition.title',
      'nodes[c1].check.title',
      'nodes[c1].check.description',
      'nodes[c1].check.definition.expected',
      'nodes[c1].check.definition.preconditions[0]',
      'nodes[c1].check.definition.steps[s1].instruction',
      'nodes[c1].check.definition.steps[s1].expected',
    ]);
  });
});

describe('ingestLanguageFields', () => {
  it('covers plan descriptions and definition wording, not only titles', () => {
    const paths = ingestLanguageFields({
      cases: [],
      plan: [
        {
          definition: {
            expected: 'e',
            preconditions: ['p'],
            steps: [{ expected: 'se', id: 's1', instruction: 'i' }],
          },
          description: 'd',
          id: 'screen',
          title: 't',
          verifierConfig: { expected: 'x', method: 'm' },
        },
      ],
    }).map((field) => field.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        'plan[screen].description',
        'plan[screen].definition.expected',
        'plan[screen].definition.preconditions[0]',
        'plan[screen].definition.steps[s1].instruction',
        'plan[screen].definition.steps[s1].expected',
      ]),
    );
  });
});
