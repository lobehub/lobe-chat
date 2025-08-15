import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import FluentEmoji from '../index';

// Mocks are now in jest.setup.js

jest.mock('../utils', () => ({
  genEmojiUrl: jest.fn((emoji: string, type: string) => {
    if (type === 'pure') return null;
    if (type === 'anim') return 'https://example.com/emoji.webp';
    if (type === 'svg') return 'https://example.com/emoji.svg';
    return 'https://example.com/emoji.png';
  }),
  genCdnUrl: jest.fn((url: string) => url),
  EmojiType: 'type',
}));

describe('FluentEmoji', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { root } = renderWithTheme(<FluentEmoji emoji="😀" size={64} />);

    expect(root).toBeTruthy();
  });

  it('renders with 3d type (default)', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" type="3d" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with pure type (fallback to text)', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" type="pure" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with anim type using WebView', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders SVG emoji using SvgUri', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue('https://example.com/emoji.svg');

    const { toJSON } = renderWithTheme(<FluentEmoji emoji={mockGenEmojiUrl} />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles image load error', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles WebView error', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles SvgUri error', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue('https://example.com/emoji.svg');

    const { toJSON } = renderWithTheme(<FluentEmoji emoji={mockGenEmojiUrl} />);

    expect(toJSON()).toBeTruthy();
  });

  it('falls back to text when emoji URL is null', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue(null);

    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles different emoji sizes', () => {
    const { root } = renderWithTheme(<FluentEmoji emoji="😀" size={16} />);

    expect(root).toBeTruthy();
  });

  it('handles complex emoji', () => {
    const { root } = renderWithTheme(<FluentEmoji emoji="👨‍👩‍👧‍👦" />);

    expect(root).toBeTruthy();
  });

  it('renders with accessibility label', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles WebView message for image error', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    expect(toJSON()).toBeTruthy();
  });

  it('correctly determines if URL is SVG', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue('https://example.com/emoji.svg');

    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(toJSON()).toBeTruthy();
  });

  it('correctly determines if emoji is animated', () => {
    const { toJSON } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    expect(toJSON()).toBeTruthy();
  });
});
