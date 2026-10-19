import path from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import type { ExtractTranslationUsesOptions } from './extract';
import { assertBoundedTranslationUses, extractTranslationUses, selectKeys } from './extract';
import { createFixture, translatorType } from './testUtils';

const extract = async (code: string, options?: ExtractTranslationUsesOptions) => {
  const root = await createFixture({
    'entry.ts': `${translatorType}\ndeclare const t: T<'chat'>;\n${code}`,
  });
  const file = path.join(root, 'entry.ts');
  return extractTranslationUses(
    ts.createProgram([file], { noLib: true, strict: true }),
    [file],
    options,
  );
};

describe('extractTranslationUses', () => {
  it('keeps literal aliases and finite unions', async () => {
    const uses = await extract(
      "const alias = t; alias('one'); declare const key: 'two' | 'three'; t(key);",
    );
    expect(uses.flatMap((use) => use.patterns)).toEqual(['one', 'two', 'three']);
  });

  it('retains all matching template keys without retaining another prefix', async () => {
    const uses = await extract(
      'declare const code: string; const key = `response.${code}`; t(key);',
    );
    expect(selectKeys(['response.401', 'response.500', 'other.401'], uses[0].patterns)).toEqual([
      'response.401',
      'response.500',
    ]);
  });

  it('retains template suffixes and the namespace of a passed translator', async () => {
    const uses = await extract(
      'function render(copy: T<"home">, kind: string) { copy(`brief.${kind}.title`); }',
    );
    expect(uses[0].namespace).toBe('home');
    expect(
      selectKeys(['brief.a.title', 'brief.b.title', 'brief.b.body'], uses[0].patterns),
    ).toEqual(['brief.a.title', 'brief.b.title']);
  });

  it('expands template literal key types', async () => {
    const uses = await extract(
      "declare const level: 'low' | 'high'; declare const key: `level.${typeof level}`; t(key);",
    );
    expect(selectKeys(['level.low', 'level.high', 'level.mid'], uses[0].patterns)).toEqual([
      'level.high',
      'level.low',
    ]);
  });

  it('requires explicit registration before retaining an entire namespace for an open string', async () => {
    const uses = await extract('declare const code: string; t(code);');
    expect(uses[0].patterns).toEqual(['.*']);
    expect(() => assertBoundedTranslationUses(uses, [])).toThrow(
      'unbounded dynamic translation key',
    );
    expect(() =>
      assertBoundedTranslationUses(uses, [
        { file: uses[0].file, namespace: 'chat', reason: 'External error codes' },
      ]),
    ).not.toThrow();
    expect(() =>
      assertBoundedTranslationUses(uses, [
        { file: uses[0].file, namespace: 'home', reason: 'Another catalog' },
      ]),
    ).toThrow('unbounded dynamic translation key');
  });

  it('rejects opaque dynamic keys instead of silently omitting them', async () => {
    await expect(extract('declare const key: any; t(key);')).rejects.toThrow(
      'Cannot statically classify translation key',
    );
  });

  it('rejects an unresolved namespace', async () => {
    await expect(extract('declare const copy: T<string>; copy("key");')).rejects.toThrow(
      'unknown translation namespace',
    );
  });

  it('records each namespace of a union-branded translator', async () => {
    const uses = await extract('declare const copy: T<"chat" | "home">; copy("title");');
    expect(uses.map((use) => use.namespace)).toEqual(['chat', 'home']);
  });

  it('rejects losing namespace identity through a callback signature', async () => {
    await expect(
      extract('function forward(copy: (key: string) => string) { copy("lost"); } forward(t);'),
    ).rejects.toThrow('namespace erased');
  });

  it('rejects erasing a translator inside an object', async () => {
    await expect(
      extract(
        'declare const bundle: { t: T<"chat"> }; const hidden: { t: (key: string) => string } = bundle; hidden.t("lost");',
      ),
    ).rejects.toThrow('namespace erased');
  });

  it('rejects indirect calls that bypass the typed call site', async () => {
    await expect(extract('t.call(undefined, "lost");')).rejects.toThrow(
      'Unsupported indirect translation call',
    );
  });

  it('preserves optional translators selected with a fallback', async () => {
    const uses = await extract(
      'declare const supplied: T<"chat"> | undefined; const copy = supplied ?? t; copy("title");',
    );
    expect(uses[0].patterns).toEqual(['title']);
  });

  it('marks calls whose result may be undefined as optional', async () => {
    const uses = await extract(
      'declare const find: ((key: string) => string | undefined) & { __i18nNamespace?: "chat" }; find("maybe"); t("always");',
    );
    expect(uses.map((use) => use.optional)).toEqual([true, false]);
  });

  it('bounds an opaque interpolation by its fixed prefix', async () => {
    const uses = await extract('declare const key: unknown; t(`response.${key}`);');
    expect(selectKeys(['response.401', 'title'], uses[0].patterns)).toEqual(['response.401']);
  });

  it('allows inferred destructuring and dropping an unused translation method', async () => {
    const uses = await extract(
      'declare const bundle: { t: T<"chat">; find: T<"chat"> }; const { t: copy } = bundle; copy("one"); const {t: other}: {t: T<"chat">} = bundle; other("two");',
    );
    expect(uses.flatMap((use) => use.patterns)).toEqual(['one', 'two']);
  });

  it('supports a custom marker and translator fields', async () => {
    const root = await createFixture({
      'entry.ts':
        'type M<N extends string> = ((key: string) => string) & { __ns?: N }; declare const bundle: { tr: M<"app"> }; const hidden: { tr: (key: string) => string } = bundle;',
    });
    const file = path.join(root, 'entry.ts');
    const program = ts.createProgram([file], { noLib: true, strict: true });
    expect(() => extractTranslationUses(program, [file], { marker: '__ns' })).not.toThrow();
    expect(() =>
      extractTranslationUses(program, [file], { marker: '__ns', translatorFields: ['tr'] }),
    ).toThrow('preserve the __ns marker');
  });

  it('skips files that implement the translator', async () => {
    const uses = await extract('declare const code: any; t(code);', { skip: () => true });
    expect(uses).toEqual([]);
  });
});
