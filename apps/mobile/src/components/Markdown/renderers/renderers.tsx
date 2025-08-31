import {
  BlockContent,
  Blockquote,
  Break,
  Code,
  Definition,
  DefinitionContent,
  Delete,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  ImageReference,
  InlineCode,
  Link,
  LinkReference,
  List,
  ListItem,
  Node,
  Paragraph,
  PhrasingContent,
  RootContent,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text,
  ThematicBreak,
  Yaml,
} from 'mdast';
import { ReactNode } from 'react';

// 扩展 Node 类型以支持数学公式
interface MathNode extends Node {
  type: 'math';
  value: string;
}

interface InlineMathNode extends Node {
  type: 'inlineMath';
  value: string;
}

export type RendererArgs<This extends Node> = {
  index?: number;
  node: This;
  parent?: Node;
};

export type RenderFunc<This extends Node, T = object> = (args: RendererArgs<This> & T) => ReactNode;

export interface Renderers {
  BlockContentRenderer: RenderFunc<BlockContent>;
  BlockquoteRenderer: RenderFunc<Blockquote>;
  BreakRenderer: RenderFunc<Break>;
  CodeRenderer: RenderFunc<Code>;
  DefinitionContentRenderer: RenderFunc<DefinitionContent>;
  DefinitionRenderer: RenderFunc<Definition>;
  DeleteRenderer: RenderFunc<Delete>;
  EmphasisRenderer: RenderFunc<Emphasis>;
  FootnoteDefinitionRenderer: RenderFunc<FootnoteDefinition>;
  FootnoteReferenceRenderer: RenderFunc<FootnoteReference>;
  HeadingRenderer: RenderFunc<Heading>;
  HtmlRenderer: RenderFunc<Html>;
  ImageReferenceRenderer: RenderFunc<ImageReference>;
  ImageRenderer: RenderFunc<Image>;
  InlineCodeRenderer: RenderFunc<InlineCode>;
  InlineMathRenderer: RenderFunc<InlineMathNode>;
  LinkReferenceRenderer: RenderFunc<LinkReference>;
  LinkRenderer: RenderFunc<Link>;
  ListItemRenderer: RenderFunc<ListItem>;
  ListRenderer: RenderFunc<List>;
  MathRenderer: RenderFunc<MathNode>;
  ParagraphRenderer: RenderFunc<Paragraph>;
  PhrasingContentRenderer: RenderFunc<PhrasingContent>;
  RootContentRenderer: RenderFunc<RootContent>;
  StrongRenderer: RenderFunc<Strong>;
  TableCellRenderer: RenderFunc<TableCell, { rowIndex: number }>;
  TableRenderer: RenderFunc<Table>;
  TableRowRenderer: RenderFunc<TableRow>;
  TextRenderer: RenderFunc<Text>;
  ThematicBreakRenderer: RenderFunc<ThematicBreak>;
  YamlRenderer: RenderFunc<Yaml>;
}
