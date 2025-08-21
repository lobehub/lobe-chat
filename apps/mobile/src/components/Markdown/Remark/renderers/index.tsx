import { BlockContentRenderer } from './blockContent';
import { BlockquoteRenderer } from './blockquote';
import { BreakRenderer } from './break';
import { CodeRenderer } from './code';
import { DefinitionRenderer } from './definition';
import { DefinitionContentRenderer } from './definitionContent';
import { DeleteRenderer } from './delete';
import { EmphasisRenderer } from './emphasis';
import { FootnoteDefinitionRenderer } from './footnoteDefinition';
import { FootnoteReferenceRenderer } from './footnoteReference';
import { HeadingRenderer } from './heading';
import { HtmlRenderer } from './html';
import { ImageReferenceRenderer, ImageRenderer } from './image';
import { InlineCodeRenderer } from './inlineCode';
import { LinkReferenceRenderer, LinkRenderer } from './link';
import { ListItemRenderer, ListRenderer } from './list';
import { ParagraphRenderer } from './paragraph';
import { PhrasingContentRenderer } from './phrasingContent';
import { Renderers } from './renderers';
import { RootContentRenderer } from './rootContent';
import { StrongRenderer } from './strong';
import { TableCellRenderer, TableRenderer, TableRowRenderer } from './table';
import { TextRenderer } from './text';
import { ThematicBreakRenderer } from './thematicBreak';
import { YamlRenderer } from './yaml';

export const defaultRenderers: Renderers = {
  BlockContentRenderer,
  BlockquoteRenderer,
  BreakRenderer,
  CodeRenderer,
  DefinitionContentRenderer,
  DefinitionRenderer,
  DeleteRenderer,
  EmphasisRenderer,
  FootnoteDefinitionRenderer,
  FootnoteReferenceRenderer,
  HeadingRenderer,
  HtmlRenderer,
  ImageReferenceRenderer,
  ImageRenderer,
  InlineCodeRenderer,
  LinkReferenceRenderer,
  LinkRenderer,
  ListItemRenderer,
  ListRenderer,
  ParagraphRenderer,
  PhrasingContentRenderer,
  RootContentRenderer,
  StrongRenderer,
  TableCellRenderer,
  TableRenderer,
  TableRowRenderer,
  TextRenderer,
  ThematicBreakRenderer,
  YamlRenderer,
};

export { RendererArgs, Renderers, RenderFunc } from './renderers';
