import { ChatMessage } from '@lobehub/ui';

import { getInputVariablesFromMessages } from '@/helpers/prompt';

describe('getInputVariablesFromMessages 方法', () => {
  it('应当在输入为空数组时返回空数组', () => {
    const result = getInputVariablesFromMessages([]);
    expect(result).toEqual([]);
  });

  it('应当在输入消息不包含变量时返回空数组', () => {
    const input: ChatMessage[] = [{ role: 'user', content: 'Hello, how are you?' }];
    const result = getInputVariablesFromMessages(input);
    expect(result).toEqual([]);
  });

  it('应当在输入消息包含变量时返回包含变量、模板和消息索引的对象数组', () => {
    const input: ChatMessage[] = [
      { role: 'user', content: 'Hello {name}, how are you?' },
      { role: 'user', content: 'My name is {name}' },
    ];
    const expectedOutput = ['name'];
    const result = getInputVariablesFromMessages(input);
    expect(result).toEqual(expectedOutput);
  });

  it('多个变量的情况', () => {
    const input: ChatMessage[] = [
      { role: 'user', content: 'Hello {name}, how are {you}?' },
      { role: 'user', content: 'My name is {name}' },
    ];
    const expectedOutput = ['name', 'you'];
    const result = getInputVariablesFromMessages(input);
    expect(result).toEqual(expectedOutput);
  });
});
