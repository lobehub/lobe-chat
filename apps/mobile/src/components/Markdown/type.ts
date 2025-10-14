// 仅用于解析数学公式
import { RemarkStyles } from './context';
import { Renderers } from './renderers/renderers';

export type MarkdownProps = {
  children: string;
  customRenderers?: Partial<Renderers>;
  customStyles?: Partial<RemarkStyles>;
  fontSize?: number;
  headerMultiple?: number;
  lineHeight?: number;
  marginMultiple?: number;
};
