import React from 'react';
import { renderWithTheme } from '@/mobile/test/utils';
import Tag from '../index';

describe('Tag', () => {
  it('renders correctly with default props', () => {
    const { getByText } = renderWithTheme(<Tag>Default Tag</Tag>);

    expect(getByText('Default Tag')).toBeTruthy();
  });

  it('renders with custom text', () => {
    const { getByText } = renderWithTheme(<Tag>Custom Tag Text</Tag>);

    expect(getByText('Custom Tag Text')).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: '#ff0000' };
    const { getByText } = renderWithTheme(<Tag style={customStyle}>Styled Tag</Tag>);

    expect(getByText('Styled Tag')).toBeTruthy();
  });

  it('renders with custom text style', () => {
    const customTextStyle = { color: '#ffffff' };
    const { getByText } = renderWithTheme(<Tag textStyle={customTextStyle}>Text Styled Tag</Tag>);

    expect(getByText('Text Styled Tag')).toBeTruthy();
  });

  it('renders with both custom style and text style', () => {
    const customStyle = { backgroundColor: '#ff0000' };
    const customTextStyle = { color: '#ffffff' };
    const { getByText } = renderWithTheme(
      <Tag style={customStyle} textStyle={customTextStyle}>
        Fully Styled Tag
      </Tag>,
    );

    expect(getByText('Fully Styled Tag')).toBeTruthy();
  });

  it('renders with empty text', () => {
    const { getByText } = renderWithTheme(<Tag></Tag>);

    expect(getByText('')).toBeTruthy();
  });

  it('renders with single character', () => {
    const { getByText } = renderWithTheme(<Tag>A</Tag>);

    expect(getByText('A')).toBeTruthy();
  });

  it('renders with long text', () => {
    const longText = 'This is a very long tag text that might need to wrap or truncate';
    const { getByText } = renderWithTheme(<Tag>{longText}</Tag>);

    expect(getByText(longText)).toBeTruthy();
  });

  it('renders with special characters', () => {
    const { getByText } = renderWithTheme(<Tag>Tag & More</Tag>);

    expect(getByText('Tag & More')).toBeTruthy();
  });

  it('renders with numbers', () => {
    const { getByText } = renderWithTheme(<Tag>123</Tag>);

    expect(getByText('123')).toBeTruthy();
  });

  it('renders with mixed characters', () => {
    const { getByText } = renderWithTheme(<Tag>Tag123!@#</Tag>);

    expect(getByText('Tag123!@#')).toBeTruthy();
  });

  it('renders with Unicode characters', () => {
    const { getByText } = renderWithTheme(<Tag>标签</Tag>);

    expect(getByText('标签')).toBeTruthy();
  });

  it('renders with emoji', () => {
    const { getByText } = renderWithTheme(<Tag>🏷️ Tag</Tag>);

    expect(getByText('🏷️ Tag')).toBeTruthy();
  });

  it('handles undefined style', () => {
    const { getByText } = renderWithTheme(<Tag style={undefined}>Undefined Style</Tag>);

    expect(getByText('Undefined Style')).toBeTruthy();
  });

  it('handles undefined text style', () => {
    const { getByText } = renderWithTheme(<Tag textStyle={undefined}>Undefined Text Style</Tag>);

    expect(getByText('Undefined Text Style')).toBeTruthy();
  });

  it('handles array of styles', () => {
    const styles = [{ backgroundColor: '#ff0000' }, { borderRadius: 8 }];
    const { getByText } = renderWithTheme(<Tag style={styles}>Array Style</Tag>);

    expect(getByText('Array Style')).toBeTruthy();
  });

  it('handles array of text styles', () => {
    const textStyles = [{ color: '#ffffff' }, { fontSize: 16 }];
    const { getByText } = renderWithTheme(<Tag textStyle={textStyles}>Array Text Style</Tag>);

    expect(getByText('Array Text Style')).toBeTruthy();
  });

  it('renders with whitespace text', () => {
    const { getByText } = renderWithTheme(<Tag> </Tag>);

    expect(getByText('   ')).toBeTruthy();
  });

  it('renders with newline characters', () => {
    const { getByText } = renderWithTheme(<Tag>Line 1\nLine 2</Tag>);

    expect(getByText('Line 1\nLine 2')).toBeTruthy();
  });

  it('renders with tab characters', () => {
    const { getByText } = renderWithTheme(<Tag>Tab\tSeparated</Tag>);

    expect(getByText('Tab\tSeparated')).toBeTruthy();
  });

  it('renders with HTML-like text', () => {
    const { getByText } = renderWithTheme(<Tag>&lt;div&gt;HTML&lt;/div&gt;</Tag>);

    expect(getByText('&lt;div&gt;HTML&lt;/div&gt;')).toBeTruthy();
  });

  it('renders with JSON-like text', () => {
    const { getByText } = renderWithTheme(<Tag>{`{"name": "value"}`}</Tag>);

    expect(getByText('{"name": "value"}')).toBeTruthy();
  });
});
