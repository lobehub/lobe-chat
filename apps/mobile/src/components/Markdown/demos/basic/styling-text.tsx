import { Markdown } from '@lobehub/ui-rn';

const stylingTextContent = `**Bold text** and __also bold__

*Italic text* and _also italic_

***Bold and italic combined***

~~Strikethrough text~~

This is <sub>subscript</sub> text

This is <sup>superscript</sup> text

This is <ins>underlined</ins> text

Press <kbd>mod+c</kbd>
`;

export default () => {
  return <Markdown>{stylingTextContent}</Markdown>;
};
