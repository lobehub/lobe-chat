import { ColorValue, Platform, TextStyle } from 'react-native';

import { Theme } from '../themes';
import { HeadingRenderer } from './heading';
import { TableCellRenderer, TableRenderer, TableRowRenderer } from './table';

const monospaceFontFamily = Platform.select({
  android: 'monospace',
  ios: 'Menlo',
});

const light = {
  bgColorHeavy: '#f5f5f5',
  bgColorLight: '#f9f9f9',
  borderColor: '#eeeeee',
  darkColor: '#d1d9e0',
  linkColor: '#007AFF',
  primaryColor: '#000000',
};
const dark = {
  bgColorHeavy: '#0b0b0b',
  bgColorLight: '#151b23',
  borderColor: '#3d444d',
  darkColor: '#bbbbbb',
  linkColor: '#007AFF',
  primaryColor: '#ffffff',
};

const headingHandler = (color: ColorValue) => {
  return (level: number): TextStyle => {
    const fontSize = 32 - level * 2;
    const fontWeight = level <= 3 ? 'bold' : '500';
    const marginVertical = level <= 3 ? 4 : 2;
    return { color, fontSize, fontWeight, marginVertical };
  };
};

export const githubTheme: Theme = {
  dark: {
    blockquote: {
      backgroundColor: dark.bgColorHeavy,
      borderLeftColor: dark.darkColor,
    },
    borderColor: dark.borderColor,
    codeBlock: {
      contentBackgroundColor: dark.bgColorLight,
      contentTextStyle: {
        color: dark.primaryColor,
      },
      headerBackgroundColor: dark.bgColorHeavy,
      headerTextStyle: {
        color: dark.primaryColor,
      },
    },
    footnoteReference: {
      color: dark.darkColor,
    },
    heading: headingHandler(dark.primaryColor),
    inlineCode: {
      backgroundColor: dark.bgColorLight,
    },
    link: {
      color: dark.linkColor,
    },
    linkReference: {
      color: dark.linkColor,
    },
    paragraph: {
      color: dark.primaryColor,
    },
    tableCell: {
      backgroundColor: dark.bgColorLight,
      color: dark.primaryColor,
    },
    thematicBreak: {
      backgroundColor: dark.borderColor,
    },
  },
  global: {
    blockquote: {
      borderLeftColor: light.darkColor,
      borderLeftWidth: 3,
      gap: 5,
      paddingBottom: 5,
      paddingLeft: 10,
      paddingRight: 5,
      paddingTop: 5,
    },
    borderColor: light.borderColor,
    break: {},
    codeBlock: {
      contentBackgroundColor: light.bgColorLight,
      contentTextStyle: {
        fontFamily: monospaceFontFamily,
        fontSize: 14,
      },
      headerBackgroundColor: light.bgColorHeavy,
      headerTextStyle: {
        fontSize: 14,
      },
    },
    container: {
      gap: 10,
    },
    delete: {
      textDecorationLine: 'line-through',
    },
    emphasis: {
      fontStyle: 'italic',
    },
    footnoteReference: {
      color: light.darkColor,
      fontSize: 10,
      fontStyle: 'italic',
    },
    heading: headingHandler(light.primaryColor),
    image: {
      borderRadius: 5,
    },
    inlineCode: {
      backgroundColor: light.bgColorLight,
      fontFamily: monospaceFontFamily,
    },
    link: {
      color: light.linkColor,
    },
    linkReference: {
      color: light.linkColor,
    },
    list: {
      gap: 5,
    },
    listItem: {
      flex: 1,
      gap: 5,
    },
    paragraph: {
      color: light.primaryColor,
      fontSize: 16,
      lineHeight: 24,
    },
    strong: {
      fontWeight: 'bold',
    },
    tableCell: {
      backgroundColor: light.bgColorLight,
      fontSize: 14,
      lineHeight: 20,
    },
    text: {},
    thematicBreak: {
      backgroundColor: light.borderColor,
      height: 5,
      marginVertical: 10,
    },
  },
  light: {},
  renderers: {
    HeadingRenderer,
    TableCellRenderer,
    TableRenderer,
    TableRowRenderer,
  },
};
