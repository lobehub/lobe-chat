import { describe, expect, it } from 'vitest';

import { chainAnswerWithContext } from '../answerWithContext';

describe('chainAnswerWithContext', () => {
  it('should generate correct chat payload with context and knowledge', () => {
    const testParams = {
      context: ['Context passage 1', 'Context passage 2'],
      knowledge: ['AI', 'Machine Learning'],
      question: 'What is artificial intelligence?',
    };

    const result = chainAnswerWithContext(testParams);

    expect(result.messages).toHaveLength(1);
    expect(result.messages![0].role).toBe('user');
    expect(result.messages![0].content).toContain('AI/Machine Learning');
    expect(result.messages![0].content).toContain('Context passage 1');
    expect(result.messages![0].content).toContain('Context passage 2');
    expect(result.messages![0].content).toContain('What is artificial intelligence?');
  });

  it('should handle single knowledge area', () => {
    const testParams = {
      context: ['Single context'],
      knowledge: ['Technology'],
      question: 'How does it work?',
    };

    const result = chainAnswerWithContext(testParams);

    expect(result.messages![0].content).toContain('Technology');
  });

  it('should handle multiple knowledge areas', () => {
    const testParams = {
      context: ['Context'],
      knowledge: ['AI', 'ML', 'NLP', 'Computer Vision'],
      question: 'Tell me about these fields',
    };

    const result = chainAnswerWithContext(testParams);

    expect(result.messages![0].content).toContain('AI/ML/NLP/Computer Vision');
  });

  it('should handle empty context array', () => {
    const testParams = {
      context: [],
      knowledge: ['AI'],
      question: 'What is AI?',
    };

    const result = chainAnswerWithContext(testParams);

    expect(result.messages![0].content).toContain('<Context>');
    expect(result.messages![0].content).toContain('</Context>');
  });

  it('should include proper context formatting', () => {
    const testParams = {
      context: ['First passage', 'Second passage'],
      knowledge: ['Test'],
      question: 'Test question',
    };

    const result = chainAnswerWithContext(testParams);

    expect(result.messages![0].content).toContain(
      '<Context>\nFirst passage\nSecond passage\n</Context>',
    );
  });

  it('should include proper instructions about using passages', () => {
    const testParams = {
      context: ['Context'],
      knowledge: ['Knowledge'],
      question: 'Question',
    };

    const result = chainAnswerWithContext(testParams);
    const content = result.messages![0].content;

    expect(content).toContain('passages might not be relevant');
    expect(content).toContain('please only use the passages that are relevant');
    expect(content).toContain('answer using your knowledge');
  });

  it('should include markdown formatting instruction', () => {
    const testParams = {
      context: ['Context'],
      knowledge: ['Knowledge'],
      question: 'Question',
    };

    const result = chainAnswerWithContext(testParams);

    expect(result.messages![0].content).toContain('follow markdown syntax');
  });
});
