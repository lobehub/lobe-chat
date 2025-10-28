import { Markdown } from '@lobehub/ui-rn';

const brContent = `**Basic Usage**

This is line 1<br>This is line 2

This is line 1<br/>This is line 2

**In Tables**

|Column 1<br/>Line 2|Column 2<br>Line 2|Column 3|
|:--|:--|:--|
|Cell 1<br/>Text|Cell 2<br>Text|Cell 3|
|Normal cell|Another<br/>cell|Last cell|

**Multiple BR Tags**

First line<br>Second line<br/>Third line

**BR Tags with Spaces**

Line with<br >space after
Line with< br/>space before
Line with< br >spaces around

**Edge Cases**

<br>Starting with br
Ending with br<br/>
<br>Multiple<br>consecutive<br/>tags
`;

export default () => {
  return <Markdown>{brContent}</Markdown>;
};
