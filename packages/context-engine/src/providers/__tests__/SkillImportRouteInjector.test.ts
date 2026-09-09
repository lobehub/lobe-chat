import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { extractSkillImportRoutes, SkillImportRouteInjector } from '../SkillImportRouteInjector';

const createContext = (messages: any[] = []): PipelineContext => ({
  initialState: {
    messages: [],
    model: 'test-model',
    provider: 'test-provider',
  },
  isAborted: false,
  messages,
  metadata: {
    maxTokens: 4000,
    model: 'test-model',
  },
});

describe('extractSkillImportRoutes', () => {
  it('extracts the identifier from a skill.md URL', () => {
    expect(
      extractSkillImportRoutes('Read https://lobehub.com/skills/anthropics-skills-pptx/skill.md'),
    ).toEqual([
      {
        identifier: 'anthropics-skills-pptx',
        url: 'https://lobehub.com/skills/anthropics-skills-pptx',
      },
    ]);
  });

  it('extracts the identifier from a bare skill page URL', () => {
    expect(extractSkillImportRoutes('https://lobehub.com/skills/openclaw-openclaw-github')).toEqual(
      [
        {
          identifier: 'openclaw-openclaw-github',
          url: 'https://lobehub.com/skills/openclaw-openclaw-github',
        },
      ],
    );
  });

  it('handles locale-prefixed and subdomain/API URLs', () => {
    expect(
      extractSkillImportRoutes(
        'https://lobehub.com/zh-CN/skills/a-b and https://market.lobehub.com/api/v1/skills/c.d/download',
      ).map((route) => route.identifier),
    ).toEqual(['a-b', 'c.d']);
  });

  it('deduplicates repeated identifiers', () => {
    expect(
      extractSkillImportRoutes(
        'https://lobehub.com/skills/x-y/skill.md then https://lobehub.com/skills/x-y',
      ),
    ).toHaveLength(1);
  });

  it('caps the number of extracted routes', () => {
    const text = Array.from({ length: 8 }, (_, i) => `https://lobehub.com/skills/skill-${i}`).join(
      ' ',
    );

    expect(extractSkillImportRoutes(text)).toHaveLength(5);
  });

  it('ignores non-skill LobeHub URLs and other hosts', () => {
    expect(
      extractSkillImportRoutes(
        'https://lobehub.com/discover/assistants https://github.com/anthropics/skills/tree/main/skills/pptx',
      ),
    ).toEqual([]);
  });

  it('ignores a skills index URL with no identifier', () => {
    expect(extractSkillImportRoutes('https://lobehub.com/skills')).toEqual([]);
  });

  it('ignores skill.md as an identifier', () => {
    expect(extractSkillImportRoutes('https://lobehub.com/skills/skill.md')).toEqual([]);
  });

  it('returns nothing for empty input', () => {
    expect(extractSkillImportRoutes('')).toEqual([]);
  });
});

describe('SkillImportRouteInjector', () => {
  // Regression: a `lobehub.com/skills/{id}/skill.md` URL used to reach the model with no
  // turn-local guidance, so it crawled the page and followed the marketplace CLI steps
  // printed there instead of calling `importFromMarket`.
  it('injects the identifier and forbids crawling when a skill URL is present', async () => {
    const injector = new SkillImportRouteInjector({ enabled: true });

    const result = await injector.process(
      createContext([
        {
          content:
            'Read https://lobehub.com/skills/anthropics-skills-pptx/skill.md and install it as documented.',
          role: 'user',
        },
      ]),
    );

    const content = result.messages[0].content as string;

    expect(content).toContain('<skill_import_route>');
    expect(content).toContain('identifier="anthropics-skills-pptx"');
    expect(content).toContain('Do NOT crawl');
    expect(result.metadata.skillImportRoute).toEqual({
      identifiers: ['anthropics-skills-pptx'],
      injected: true,
    });
  });

  // The CLI is a genuine fallback for agents with no Skill Store tool, so it stays in the
  // ladder — it just must never be the first step, which is what happened in the report.
  it('orders the install ladder importFromMarket → importSkill → CLI', async () => {
    const injector = new SkillImportRouteInjector({ enabled: true });

    const result = await injector.process(
      createContext([
        {
          content:
            'https://lobehub.com/skills/anthropics-skills-pptx/skill.md — install as documented',
          role: 'user',
        },
      ]),
    );

    const content = result.messages[0].content as string;

    expect(content).toContain('never skip up it');
    expect(content.indexOf('importFromMarket')).toBeLessThan(content.indexOf('importSkill'));
    expect(content.indexOf('importSkill')).toBeLessThan(content.indexOf('market-cli'));
    expect(content).toContain('last resort');
    // The exact phrase that talked the model into the CLI in the original report.
    expect(content).toContain('install it as documented');
  });

  it('appends to the last user message only', async () => {
    const injector = new SkillImportRouteInjector({ enabled: true });

    const result = await injector.process(
      createContext([
        { content: 'https://lobehub.com/skills/old-one', role: 'user' },
        { content: 'ok', role: 'assistant' },
        { content: 'now https://lobehub.com/skills/new-one', role: 'user' },
      ]),
    );

    expect(result.messages[0].content).toBe('https://lobehub.com/skills/old-one');
    expect(result.messages[2].content).toContain('identifier="new-one"');
    expect(result.messages[2].content).not.toContain('identifier="old-one"');
  });

  it('handles multimodal content by appending to the last text part', async () => {
    const injector = new SkillImportRouteInjector({ enabled: true });

    const result = await injector.process(
      createContext([
        {
          content: [
            { image_url: { url: 'https://example.com/a.png' }, type: 'image_url' },
            { text: 'install https://lobehub.com/skills/a-b/skill.md', type: 'text' },
          ],
          role: 'user',
        },
      ]),
    );

    const parts = result.messages[0].content as any[];
    expect(parts[1].text).toContain('identifier="a-b"');
  });

  it('skips injection when no skill URL is present', async () => {
    const injector = new SkillImportRouteInjector({ enabled: true });

    const result = await injector.process(
      createContext([{ content: 'make me a deck about otters', role: 'user' }]),
    );

    expect(result.messages[0].content).toBe('make me a deck about otters');
    expect(result.metadata.skillImportRoute).toBeUndefined();
  });

  it('skips injection when disabled', async () => {
    const injector = new SkillImportRouteInjector({ enabled: false });

    const result = await injector.process(
      createContext([
        { content: 'https://lobehub.com/skills/anthropics-skills-pptx/skill.md', role: 'user' },
      ]),
    );

    expect(result.messages[0].content).toBe(
      'https://lobehub.com/skills/anthropics-skills-pptx/skill.md',
    );
    expect(result.metadata.skillImportRoute).toBeUndefined();
  });

  it('skips injection when there is no user message', async () => {
    const injector = new SkillImportRouteInjector({ enabled: true });

    const result = await injector.process(
      createContext([{ content: 'https://lobehub.com/skills/a-b', role: 'assistant' }]),
    );

    expect(result.metadata.skillImportRoute).toBeUndefined();
  });
});
