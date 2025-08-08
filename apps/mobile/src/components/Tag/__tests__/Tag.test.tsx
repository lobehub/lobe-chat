import React from 'react';
import { renderWithTheme } from '@/test/utils';
import Tag from '../index';

describe('Tag', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = renderWithTheme(<Tag>Default Tag</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom text', () => {
    const { toJSON } = renderWithTheme(<Tag>Custom Tag Text</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: '#ff0000' };
    const { toJSON } = renderWithTheme(<Tag style={customStyle}>Styled Tag</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom text style', () => {
    const customTextStyle = { color: '#ffffff' };
    const { toJSON } = renderWithTheme(<Tag textStyle={customTextStyle}>Text Styled Tag</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with both custom style and text style', () => {
    const customStyle = { backgroundColor: '#ff0000' };
    const customTextStyle = { color: '#ffffff' };
    const { toJSON } = renderWithTheme(
      <Tag style={customStyle} textStyle={customTextStyle}>
        Fully Styled Tag
      </Tag>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with empty text', () => {
    const { toJSON } = renderWithTheme(<Tag></Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with single character', () => {
    const { toJSON } = renderWithTheme(<Tag>A</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with long text', () => {
    const longText = 'This is a very long tag text that might need to wrap or truncate';
    const { toJSON } = renderWithTheme(<Tag>{longText}</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with special characters', () => {
    const { toJSON } = renderWithTheme(<Tag>Tag & More</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with numbers', () => {
    const { toJSON } = renderWithTheme(<Tag>123</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with mixed characters', () => {
    const { toJSON } = renderWithTheme(<Tag>Tag123!@#</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with Unicode characters', () => {
    const { toJSON } = renderWithTheme(<Tag>标签</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with emoji', () => {
    const { toJSON } = renderWithTheme(<Tag>🏷️ Tag</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('handles undefined style', () => {
    const { toJSON } = renderWithTheme(<Tag style={undefined}>Undefined Style</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('handles undefined text style', () => {
    const { toJSON } = renderWithTheme(<Tag textStyle={undefined}>Undefined Text Style</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('handles array of styles', () => {
    const styles = [{ backgroundColor: '#ff0000' }, { borderRadius: 8 }];
    const { toJSON } = renderWithTheme(<Tag style={styles}>Array Style</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('handles array of text styles', () => {
    const textStyles = [{ color: '#ffffff' }, { fontSize: 16 }];
    const { toJSON } = renderWithTheme(<Tag textStyle={textStyles}>Array Text Style</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with whitespace text', () => {
    const { toJSON } = renderWithTheme(<Tag> </Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with newline characters', () => {
    const { toJSON } = renderWithTheme(<Tag>Line 1 Line 2</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with tab characters', () => {
    const { toJSON } = renderWithTheme(<Tag>Tab Separated</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with HTML-like text', () => {
    const { toJSON } = renderWithTheme(<Tag>&lt;div&gt;HTML&lt;/div&gt;</Tag>);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with JSON-like text', () => {
    const { toJSON } = renderWithTheme(<Tag>{`{"name": "value"}`}</Tag>);

    expect(toJSON()).toBeTruthy();
  });
});
