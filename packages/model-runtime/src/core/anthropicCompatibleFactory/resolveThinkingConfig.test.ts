import { describe, expect, it } from 'vitest';

import { resolveClaudeThinkingConfig } from './resolveThinkingConfig';

const resolve = (
  model: string,
  thinking?: Parameters<typeof resolveClaudeThinkingConfig>[0]['thinking'],
) => resolveClaudeThinkingConfig({ maxTokens: 64_000, model, thinking });

describe('resolveClaudeThinkingConfig', () => {
  describe('models that ship thinking on', () => {
    it.each(['claude-fable-5', 'claude-opus-5', 'claude-sonnet-5'])(
      'should request summarized thinking for %s even without a thinking config',
      (model) => {
        // Regression: these models think (and bill) on every request, and default `display` to
        // `omitted`, so sending no thinking config returned empty reasoning blocks.
        expect(resolve(model)).toEqual({ display: 'summarized', type: 'adaptive' });
      },
    );

    it('should keep forwarding an explicit disabled thinking config', () => {
      expect(resolve('claude-sonnet-5', { type: 'disabled' })).toEqual({ type: 'disabled' });
    });

    it('should omit the thinking config on models that reject disabled thinking', () => {
      // Claude Fable 5 returns a 400 for `thinking.type: 'disabled'`; omitting the config keeps
      // its default `omitted` display, which is what turning the switch off asks for.
      expect(resolve('claude-fable-5', { type: 'disabled' })).toBeUndefined();
    });

    it('should omit disabled thinking when the mapped request model always thinks', () => {
      // A channel may redirect Sonnet 5 (which accepts `disabled`) to Sonnet 5.5 upstream.
      expect(
        resolveClaudeThinkingConfig({
          maxTokens: 4096,
          model: 'claude-sonnet-5',
          requestModel: 'global.anthropic.claude-sonnet-5-5',
          thinking: { type: 'disabled' },
        }),
      ).toBeUndefined();
    });
  });

  describe('models that removed manual thinking budgets', () => {
    it.each(['claude-haiku-5-5', 'claude-opus-5', 'claude-sonnet-5-5', 'claude-opus-4-7'])(
      'should send adaptive instead of an enabled budget for %s',
      (model) => {
        // Regression: Haiku 5.5 returned `"thinking.enabled" is not supported for this model`.
        expect(resolve(model, { budget_tokens: 2048, type: 'enabled' })).toEqual({
          display: 'summarized',
          type: 'adaptive',
        });
      },
    );

    it('should send adaptive when only the mapped request model removed budgets', () => {
      expect(
        resolveClaudeThinkingConfig({
          maxTokens: 4096,
          model: 'custom-claude',
          requestModel: 'global.anthropic.claude-haiku-5-5',
          thinking: { budget_tokens: 2048, type: 'enabled' },
        }),
      ).toEqual({ type: 'adaptive' });
    });

    it('should keep the enabled budget on models that still accept it', () => {
      expect(resolve('claude-haiku-4-5', { budget_tokens: 2048, type: 'enabled' })).toEqual({
        budget_tokens: 2048,
        type: 'enabled',
      });
    });
  });

  describe('models that default thinking off but omit the display', () => {
    it.each(['claude-opus-4-8', 'claude-opus-4-7'])(
      'should not turn thinking on for %s when no config is given',
      (model) => {
        expect(resolve(model)).toBeUndefined();
      },
    );

    it.each(['claude-opus-4-8', 'claude-opus-4-7'])(
      'should request summarized thinking for %s once adaptive is enabled',
      (model) => {
        expect(resolve(model, { type: 'adaptive' })).toEqual({
          display: 'summarized',
          type: 'adaptive',
        });
      },
    );

    it('should not forward a disabled config to a model that already defaults off', () => {
      expect(resolve('claude-opus-4-8', { type: 'disabled' })).toBeUndefined();
    });
  });

  describe('models that still default the display to summarized', () => {
    it.each(['claude-opus-4-6', 'claude-sonnet-4-6'])('should leave %s untouched', (model) => {
      expect(resolve(model)).toBeUndefined();
      expect(resolve(model, { type: 'adaptive' })).toEqual({ type: 'adaptive' });
    });

    it('should cap the manual budget below max_tokens without adding a display', () => {
      expect(
        resolveClaudeThinkingConfig({
          maxTokens: 8000,
          model: 'claude-sonnet-4-6',
          thinking: { budget_tokens: 32_000, type: 'enabled' },
        }),
      ).toEqual({ budget_tokens: 7999, type: 'enabled' });
    });
  });

  describe('an explicit display from the caller', () => {
    it('should win over the model default', () => {
      expect(resolve('claude-opus-4-7', { display: 'omitted', type: 'adaptive' })).toEqual({
        display: 'omitted',
        type: 'adaptive',
      });
    });

    it('should be honored on models that default to summarized', () => {
      expect(resolve('claude-opus-4-6', { display: 'omitted', type: 'adaptive' })).toEqual({
        display: 'omitted',
        type: 'adaptive',
      });
    });

    it('should be dropped alongside disabled thinking, where display is invalid', () => {
      expect(resolve('claude-sonnet-5', { display: 'omitted', type: 'disabled' })).toEqual({
        type: 'disabled',
      });
    });
  });

  it('should ignore non-Claude models', () => {
    expect(resolve('gpt-5')).toBeUndefined();
    expect(resolve('gpt-5', { type: 'disabled' })).toBeUndefined();
  });
});
