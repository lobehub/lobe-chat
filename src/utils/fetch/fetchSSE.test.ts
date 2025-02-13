import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageToolCallSchema } from '@/types/message';

import { createSmoothMessage, createSmoothToolCalls } from './fetchSSE';

describe('createSmoothMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should create smooth message controller with basic functionality', () => {
    const onTextUpdate = vi.fn();
    const controller = createSmoothMessage({ onTextUpdate });

    expect(controller.isAnimationActive).toBe(false);
    expect(controller.isTokenRemain()).toBe(false);
    expect(typeof controller.pushToQueue).toBe('function');
    expect(typeof controller.startAnimation).toBe('function');
    expect(typeof controller.stopAnimation).toBe('function');
  });

  it('should handle text animation correctly', async () => {
    const onTextUpdate = vi.fn();
    const controller = createSmoothMessage({ onTextUpdate });

    controller.pushToQueue('Hello');
    expect(controller.isTokenRemain()).toBe(true);

    const animationPromise = controller.startAnimation();

    // Simulate frame updates
    for (let i = 0; i < 10; i++) {
      await vi.advanceTimersByTimeAsync(16);
    }

    await animationPromise;

    expect(onTextUpdate).toHaveBeenCalled();
    expect(controller.isTokenRemain()).toBe(false);
  });

  it('should stop animation when requested', async () => {
    const onTextUpdate = vi.fn();
    const controller = createSmoothMessage({ onTextUpdate });

    controller.pushToQueue('Hello World');
    const animationPromise = controller.startAnimation();

    // Let some frames pass
    await vi.advanceTimersByTimeAsync(32);

    controller.stopAnimation();

    // Ensure animation stops
    const callCount = onTextUpdate.mock.calls.length;
    await vi.advanceTimersByTimeAsync(32);
    expect(onTextUpdate).toHaveBeenCalledTimes(callCount);
  });

  it('should handle multiple text chunks', async () => {
    const onTextUpdate = vi.fn();
    const controller = createSmoothMessage({ onTextUpdate });

    controller.pushToQueue('First');
    const promise1 = controller.startAnimation();

    // Process first chunk
    await vi.advanceTimersByTimeAsync(100);
    await promise1;

    controller.pushToQueue('Second');
    const promise2 = controller.startAnimation();

    // Process second chunk
    await vi.advanceTimersByTimeAsync(100);
    await promise2;

    expect(onTextUpdate).toHaveBeenCalled();
  });
});

describe('createSmoothToolCalls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should create smooth tool calls controller with basic functionality', () => {
    const onToolCallsUpdate = vi.fn();
    const controller = createSmoothToolCalls({ onToolCallsUpdate });

    expect(controller.isAnimationActives).toEqual([]);
    expect(controller.isTokenRemain()).toBe(false);
    expect(typeof controller.pushToQueue).toBe('function');
    expect(typeof controller.startAnimations).toBe('function');
    expect(typeof controller.stopAnimations).toBe('function');
  });

  it('should handle tool calls animation correctly', async () => {
    const onToolCallsUpdate = vi.fn();
    const controller = createSmoothToolCalls({ onToolCallsUpdate });

    const toolCall = {
      index: 0,
      id: 'test-id',
      type: 'function' as const,
      function: {
        name: 'test',
        arguments: 'test',
      },
    };

    controller.pushToQueue([toolCall]);
    const animationPromise = controller.startAnimations();

    // Process frames
    await vi.advanceTimersByTimeAsync(100);
    await animationPromise;

    expect(onToolCallsUpdate).toHaveBeenCalled();
    expect(controller.isTokenRemain()).toBe(false);
  });

  it('should stop all animations when requested', async () => {
    const onToolCallsUpdate = vi.fn();
    const controller = createSmoothToolCalls({ onToolCallsUpdate });

    const toolCalls = [
      {
        index: 0,
        id: 'test-id-1',
        type: 'function' as const,
        function: {
          name: 'test1',
          arguments: 'args1',
        },
      },
      {
        index: 1,
        id: 'test-id-2',
        type: 'function' as const,
        function: {
          name: 'test2',
          arguments: 'args2',
        },
      },
    ];

    controller.pushToQueue(toolCalls);
    controller.startAnimations();

    // Let some frames pass
    await vi.advanceTimersByTimeAsync(32);

    controller.stopAnimations();

    // Ensure animations stop
    const callCount = onToolCallsUpdate.mock.calls.length;
    await vi.advanceTimersByTimeAsync(32);
    expect(onToolCallsUpdate).toHaveBeenCalledTimes(callCount);
  });

  it('should handle multiple tool calls concurrently', async () => {
    const onToolCallsUpdate = vi.fn();
    const controller = createSmoothToolCalls({ onToolCallsUpdate });

    const toolCalls = [
      {
        index: 0,
        id: 'test-id-1',
        type: 'function' as const,
        function: {
          name: 'test1',
          arguments: 'a1',
        },
      },
      {
        index: 1,
        id: 'test-id-2',
        type: 'function' as const,
        function: {
          name: 'test2',
          arguments: 'a2',
        },
      },
    ];

    controller.pushToQueue(toolCalls);
    const animationPromise = controller.startAnimations();

    // Process frames
    await vi.advanceTimersByTimeAsync(100);
    await animationPromise;

    expect(onToolCallsUpdate).toHaveBeenCalled();
    expect(controller.isTokenRemain()).toBe(false);
  });
});
