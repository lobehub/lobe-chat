import { describe, expect, it } from 'vitest';

import { parseFeatureFlag } from './parser';

describe('parseFeatureFlag', () => {
  it('should parse an empty string into an empty object', () => {
    expect(parseFeatureFlag('')).toEqual({});
  });

  it('should enable a feature when prefixed with +', () => {
    expect(parseFeatureFlag('+webrtc_sync')).toEqual({ webrtc_sync: true });
  });

  it('should disable a feature when prefixed with -', () => {
    expect(parseFeatureFlag('-openai_api_key')).toEqual({ openai_api_key: false });
  });

  it('should handle multiple flags separated by commas', () => {
    const input = '+webrtc_sync,-openai_api_key,+another_feature';

    expect(parseFeatureFlag(input)).toEqual({
      webrtc_sync: true,
      openai_api_key: false,
    });
  });

  it('should handle flags with values', () => {
    const input = '+model_tag_display_mode=model_name';
    expect(parseFeatureFlag(input)).toEqual({
      model_tag_display_mode: 'model_name',
    });
  });

  it('should handle multiple flags with and without values', () => {
    const input = '+webrtc_sync,-openai_api_key,+model_tag_display_mode=model_name';
    expect(parseFeatureFlag(input)).toEqual({
      webrtc_sync: true,
      openai_api_key: false,
      model_tag_display_mode: 'model_name',
    });
  });

  it('should hide content with commercial flags', () => {
    const input = '+commercial_hide_github,+commercial_hide_docs';
    expect(parseFeatureFlag(input)).toEqual({
      commercial_hide_docs: true,
      commercial_hide_github: true,
    });
  });

  it('should ignore invalid flag format', () => {
    const input = 'invalid_format';
    expect(parseFeatureFlag(input)).toEqual({});
  });

  it('should ignore invalid flag format with colon', () => {
    const input = '+webrtc_sync:unexpected';
    expect(parseFeatureFlag(input)).toEqual({});
  });

  it('should handle flags separated by Chinese commas', () => {
    const input = '+webrtc_sync，-openai_api_key，+model_tag_display_mode=model_name';

    expect(parseFeatureFlag(input)).toEqual({
      webrtc_sync: true,
      openai_api_key: false,
      model_tag_display_mode: 'model_name',
    });
  });

  it('should ignore whitespace around flags', () => {
    const input = '  +webrtc_sync  ,  -openai_api_key  , +model_tag_display_mode = model_name ';

    expect(parseFeatureFlag(input)).toEqual({
      webrtc_sync: true,
      openai_api_key: false,
      model_tag_display_mode: 'model_name',
    });
  });

  it('should ignore flags not defined in FeatureFlagsSchema', () => {
    const input = '+webrtc_sync,-openai_api_key,+unknown_feature,+another_unknown=value';

    expect(parseFeatureFlag(input)).toEqual({
      webrtc_sync: true,
      openai_api_key: false,
    });
  });

  it('should handle undefined input', () => {
    expect(parseFeatureFlag(undefined)).toEqual({});
  });
});
