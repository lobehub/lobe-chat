import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

// Advanced demos
import AlertsDemo from './advanced/alerts';
import MathDemo from './advanced/math';
import MermaidDemo from './advanced/mermaid';
// Basic demos
import BrDemo from './basic/br';
import HeadingsDemo from './basic/headings';
import LinksDemo from './basic/links';
import ListsDemo from './basic/lists';
import QuotesDemo from './basic/quotes';
import StylingTextDemo from './basic/styling-text';
import TablesDemo from './basic/tables';
import TaskListsDemo from './basic/task-lists';
// Code demos
import CodeBlocksDemo from './code/code-blocks';
import InlineCodeDemo from './code/inline-code';
import LanguagesDemo from './code/languages';
// Footnotes demo
import FootnotesDemo from './footnotes/footnotes';
// Media demo
import ImageDemo from './media/image';
import VideoDemo from './media/video';
// Streaming demo
import StreamingDemo from './streaming';

// Variant demo

const demos: DemoConfig = [
  // Basic
  { component: <HeadingsDemo />, key: 'headings', title: '标题' },
  { component: <StylingTextDemo />, key: 'styling-text', title: '文本样式' },
  { component: <ListsDemo />, key: 'lists', title: '列表' },
  { component: <TaskListsDemo />, key: 'task-lists', title: '任务列表' },
  { component: <LinksDemo />, key: 'links', title: '链接' },
  { component: <QuotesDemo />, key: 'quotes', title: '引用' },
  { component: <TablesDemo />, key: 'tables', title: '表格' },
  { component: <BrDemo />, key: 'line-breaks', title: '换行' },

  // Media
  { component: <ImageDemo />, key: 'image', title: '图片' },
  { component: <VideoDemo />, key: 'video', title: '视频' },

  // Code
  { component: <InlineCodeDemo />, key: 'inline-code', title: '内联代码' },
  { component: <CodeBlocksDemo />, key: 'code-blocks', title: '代码块' },
  { component: <LanguagesDemo />, key: 'languages', title: '多语言代码' },

  // Advanced
  { component: <MathDemo />, key: 'math', title: '数学公式' },
  { component: <AlertsDemo />, key: 'alerts', title: '提示框' },
  { component: <MermaidDemo />, key: 'mermaid', title: 'Mermaid 图表' },

  // Footnotes
  { component: <FootnotesDemo />, key: 'footnotes', title: '脚注' },

  // Streaming
  { component: <StreamingDemo />, key: 'streaming', title: '流式渲染' },
];

export default demos;
