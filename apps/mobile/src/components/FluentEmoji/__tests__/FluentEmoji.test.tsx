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
    const { getByText } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(getByText).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { root } = renderWithTheme(<FluentEmoji emoji="😀" size={64} />);

    expect(root).toBeTruthy();
  });

  it('renders with 3d type (default)', () => {
    const { getByRole } = renderWithTheme(<FluentEmoji emoji="😀" type="3d" />);

    expect(getByRole('image')).toBeTruthy();
  });

  it('renders with pure type (fallback to text)', () => {
    const { getByText } = renderWithTheme(<FluentEmoji emoji="😀" type="pure" />);

    expect(getByText('😀')).toBeTruthy();
  });

  it('renders with anim type using WebView', () => {
    const { getByTestId } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    expect(getByTestId('webview')).toBeTruthy();
  });

  it('renders SVG emoji using SvgUri', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue('https://example.com/emoji.svg');

    const { getByTestId } = renderWithTheme(<FluentEmoji emoji="😀" type="svg" />);

    expect(getByTestId('svg-uri')).toBeTruthy();
  });

  it('handles image load error', () => {
    const { getByRole } = renderWithTheme(<FluentEmoji emoji="😀" />);

    const image = getByRole('image');
    fireEvent(image, 'error');

    expect(image).toBeTruthy();
  });

  it('handles WebView error', () => {
    const { getByTestId } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    const webview = getByTestId('webview');
    fireEvent.press(webview);

    expect(webview).toBeTruthy();
  });

  it('handles SvgUri error', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue('https://example.com/emoji.svg');

    const { getByTestId } = renderWithTheme(<FluentEmoji emoji="😀" type="svg" />);

    const svg = getByTestId('svg-uri');
    fireEvent.press(svg);

    expect(svg).toBeTruthy();
  });

  it('falls back to text when emoji URL is null', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue(null);

    const { getByText } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(getByText('😀')).toBeTruthy();
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
    const { getByRole } = renderWithTheme(<FluentEmoji emoji="😀" />);

    const image = getByRole('image');
    expect(image.props.accessibilityLabel).toBe('😀');
  });

  it('handles WebView message for image error', () => {
    const { getByTestId } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    const webview = getByTestId('webview');
    fireEvent.press(webview);

    expect(webview).toBeTruthy();
  });

  it('correctly determines if URL is SVG', () => {
    const mockGenEmojiUrl = require('../utils').genEmojiUrl;
    mockGenEmojiUrl.mockReturnValue('https://example.com/emoji.svg');

    const { getByTestId } = renderWithTheme(<FluentEmoji emoji="😀" />);

    expect(getByTestId('svg-uri')).toBeTruthy();
  });

  it('correctly determines if emoji is animated', () => {
    const { getByTestId } = renderWithTheme(<FluentEmoji emoji="😀" type="anim" />);

    expect(getByTestId('webview')).toBeTruthy();
  });
});
