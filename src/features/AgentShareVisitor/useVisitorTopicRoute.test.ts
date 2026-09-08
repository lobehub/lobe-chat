import { act, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useVisitorTopicRoute } from './useVisitorTopicRoute';

const setup = (initialEntry = '/a/my-bot/tpc_1') => {
  let router: ReturnType<typeof createMemoryRouter>;
  const wrapper = ({ children }: PropsWithChildren) => {
    router = createMemoryRouter([{ element: children, path: '/a/:slugOrId/:topicId?' }], {
      initialEntries: [initialEntry],
    });
    return createElement(RouterProvider, { router });
  };
  const hook = renderHook(useVisitorTopicRoute, { wrapper });
  return { ...hook, getRouter: () => router };
};

describe('useVisitorTopicRoute', () => {
  it('updates the URL for selection and restores topics through back/forward', async () => {
    const { result, getRouter } = setup();
    expect(result.current.topicId).toBe('tpc_1');
    await act(() => result.current.selectTopic('tpc_2'));
    expect(getRouter().state.location.pathname).toBe('/a/my-bot/tpc_2');
    expect(result.current.topicId).toBe('tpc_2');
    await act(() => getRouter().navigate(-1));
    expect(result.current.topicId).toBe('tpc_1');
    await act(() => getRouter().navigate(1));
    expect(result.current.topicId).toBe('tpc_2');
    await act(() => result.current.selectTopic());
    expect(getRouter().state.location.pathname).toBe('/a/my-bot');
    expect(result.current.topicId).toBeUndefined();
  });

  it('replaces the blank conversation URL once a topic is created', async () => {
    const { result, getRouter } = setup();
    await act(() => result.current.selectTopic());
    await act(() => result.current.onTopicCreated('tpc_created'));
    expect(getRouter().state.location.pathname).toBe('/a/my-bot/tpc_created');
    await act(() => getRouter().navigate(-1));
    expect(result.current.topicId).toBe('tpc_1');
  });

  it('does not push a duplicate entry when the destination is already current', async () => {
    const { result, getRouter } = setup('/a/my-bot');
    const initialKey = getRouter().state.location.key;
    await act(() => result.current.selectTopic());
    expect(getRouter().state.location.key).toBe(initialKey);
    // A first message that was still creating its topic must still land in the URL.
    await act(() => result.current.onTopicCreated('tpc_created'));
    expect(getRouter().state.location.pathname).toBe('/a/my-bot/tpc_created');
    const createdKey = getRouter().state.location.key;
    await act(() => result.current.selectTopic('tpc_created'));
    expect(getRouter().state.location.key).toBe(createdKey);
  });

  it('does not navigate back when a send finishes after selecting another topic', async () => {
    const { result, getRouter } = setup('/a/my-bot');
    const onTopicCreated = result.current.onTopicCreated;
    await act(() => result.current.selectTopic('tpc_other'));
    await act(() => onTopicCreated('tpc_late'));
    expect(getRouter().state.location.pathname).toBe('/a/my-bot/tpc_other');
  });
});
