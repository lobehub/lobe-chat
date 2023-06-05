import { ChatMessage } from '@lobehub/ui';
import { genChatMessages } from './genChatMessages';

describe('genMessages', () => {
  it('should return an array of ChatMessage', () => {
    const result = genChatMessages({
      messages: [],
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.every((message) => message.role && message.content)).toBe(true);
  });

  it('should add systemRole message at the beginning', () => {
    const systemRole = 'Welcome to the chat room!';
    const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
    const result = genChatMessages({ systemRole, messages });
    expect(result[0].content).toBe(systemRole);
    expect(result[0].role).toBe('system');
    expect(result[1]).toEqual(messages[0]);
  });

  it('should add user message at the end', () => {
    const message = 'Hi, there!';
    const messages: ChatMessage[] = [{ role: 'system', content: 'Welcome' }];
    const result = genChatMessages({ messages, message });
    expect(result[result.length - 1].content).toBe(message);
    expect(result[result.length - 1].role).toBe('user');
    expect(result[0]).toEqual(messages[0]);
  });

  it('should filter out null values', () => {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'Welcome' },
      // @ts-ignore
      null,
      { role: 'user', content: 'Hi' },
      // @ts-ignore
      null,
    ];
    const result = genChatMessages({ messages });
    expect(result.length).toBe(2);
    expect(result[0].content).toEqual(messages[0].content);
    expect(result[1].content).toEqual(messages[2].content);
  });
  it('需要过滤 choice 字段', () => {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content:
          '概念：业务空间\n\n介绍： 产品研发、业务项目迭代，包含了一个项目中的设计资产、文档等内容',
      },
      {
        role: 'assistant',
        content: '系统输出: 文件夹、笔记本、白板、项目管理工具、流程图',
        choices: [
          '1. 标准化的设计模板\n2. 可重复使用的设计组件\n3. 统一的配色方案\n4. 图标库和字体库\n5. 前端代码库',
          '1.模板库\n2.组件库\n3.设计指南\n4.样式库\n5.元素库',
          '1. 蓝图\n2. 模板\n3. 工具箱\n4. 组件库\n5. 样式指南',
          '1. 蓝图\n2. 模板\n3. 工具箱\n4. 书籍\n5. 调色板',
          '[输出]\n文件夹、工作台、书架、仓库、档案室',
          '你的输出: 文件夹、档案柜、云盘、收纳盒、标签',
        ],
      },
      {
        role: 'user',
        content:
          '概念：资产库\n\n介绍： 小到一张图片，大到一个业务的标准解决方案，都可以使用该模板。例如插图素材库、图标合集等等。',
      },
    ];

    const result = genChatMessages({
      systemRole:
        '你是一名擅长进行概念抽象的设计师，你需要将用户所提出的概念和描述抽取出 5 个可以表达物理实体的概念，例如猫、狗等等。\n\n例子1：\n\n【用户输入】\n概念：隐私保护计算\n介绍: 隐私保护计算（Privacy Preserving Computing），又称“隐私计算”，是指在提 供数据隐私保护的前提下，对数据进行分析计算的一类技术。 进而在保障数据隐私 安全的基础上，可以让数据以“可用不可见”的方式进行安全流通。 隐私保护计算 是一个技术体系，而非一项单一的技术。\n\n【输出】\n计算机、粒子、闪电、面具、服务器\n\n例子2：\n【用户输入】\n概念: 设计系统\n介绍: 设计系统的定义是一系列文档元素、组件、设计和前端指南的等完整的标准。 有了设计系统，可以轻松地在应用程序的多个实例中重复使用样式和组件，快速构建一个或多个产品，从而简化大规模设计。\n\n【输出】\n蓝图、模板、工具箱、书籍、调色板',
      messages,
    });
    expect(result.length).toBe(4);
    expect(result[2].choices).toBe(undefined);
  });
});
