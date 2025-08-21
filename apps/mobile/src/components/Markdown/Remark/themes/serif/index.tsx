import { ColorValue, Platform, TextStyle } from 'react-native';

import { Theme } from '../themes';

const fontFamily = Platform.select({
  android: 'serif',
  ios: 'Georgia',
});
const monospaceFontFamily = Platform.select({
  android: 'monospace',
  ios: 'Menlo',
});

const light = {
  bgColorHeavy: '#f5f5f5',
  bgColorLight: '#f9f9f9',
  borderColor: '#eeeeee',
  darkColor: '#444444',
  linkColor: '#007AFF',
  primaryColor: '#000000',
};
const dark = {
  bgColorHeavy: '#0b0b0b',
  bgColorLight: '#070707',
  borderColor: '#222222',
  darkColor: '#bbbbbb',
  linkColor: '#007AFF',
  primaryColor: '#ffffff',
};

const headingHandler = (color: ColorValue) => {
  return (level: number): TextStyle => {
    const fontSize = 28 - level * 2;
    const fontWeight = level <= 3 ? 'bold' : '500';
    const marginVertical = level <= 3 ? 4 : 2;
    return { color, fontFamily, fontSize, fontWeight, marginVertical };
  };
};

export const serifTheme: Theme = {
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
      color: dark.primaryColor,
    },
    thematicBreak: {
      backgroundColor: dark.borderColor,
    },
  },
  global: {
    blockquote: {
      backgroundColor: light.bgColorHeavy,
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
        fontFamily,
        fontSize: 14,
      },
    },
    container: {
      gap: 10,
    },
    delete: {
      fontFamily,
      textDecorationLine: 'line-through',
    },
    emphasis: {
      fontFamily,
      fontStyle: 'italic',
    },
    footnoteReference: {
      color: light.darkColor,
      fontFamily,
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
      fontFamily,
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
      fontFamily,
      fontSize: 16,
      lineHeight: 24,
    },
    strong: {
      fontFamily,
      fontWeight: 'bold',
    },
    tableCell: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
    },
    text: {},
    thematicBreak: {
      backgroundColor: light.borderColor,
      height: 1,
      marginVertical: 10,
    },
  },
  light: {},
};
