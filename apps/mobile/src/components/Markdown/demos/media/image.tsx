import { Markdown } from '@lobehub/ui-rn';

const image = `![shields](https://img.shields.io/badge/LobeHub-Readme%20Generator-white?labelColor=black&style=flat-square)

![Gallery Image](https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d)`;

export default () => {
  return <Markdown>{image}</Markdown>;
};
