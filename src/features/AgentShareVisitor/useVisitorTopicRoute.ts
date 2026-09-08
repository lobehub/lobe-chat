import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { buildAgentShareVisitorPath } from './visitorPath';

/** The URL owns selection; a created topic replaces its blank conversation entry. */
export const useVisitorTopicRoute = () => {
  const { slugOrId = '', topicId } = useParams<{ slugOrId: string; topicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocationKey = useRef<string | undefined>(location.key);

  useLayoutEffect(() => {
    currentLocationKey.current = location.key;
    return () => {
      currentLocationKey.current = undefined;
    };
  }, [location.key]);

  /**
   * Re-selecting the current topic (or "new topic" while already on the blank
   * conversation) must not push a duplicate history entry: Back would look
   * inert, and the new location key would make a still-pending
   * `onTopicCreated` think the visitor left and skip the URL replacement.
   */
  const navigateIfChanged = (path: string, options?: { replace?: boolean }) => {
    if (path === location.pathname) return;
    navigate(path, options);
  };

  return {
    onTopicCreated: (createdTopicId: string) => {
      /** A delayed send must not pull the visitor back after they navigate away. */
      if (currentLocationKey.current !== location.key) return;
      navigateIfChanged(buildAgentShareVisitorPath(slugOrId, createdTopicId), { replace: true });
    },
    selectTopic: (nextTopicId?: string) => {
      navigateIfChanged(buildAgentShareVisitorPath(slugOrId, nextTopicId));
    },
    topicId,
  };
};
