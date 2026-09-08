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

  return {
    onTopicCreated: (createdTopicId: string) => {
      /** A delayed send must not pull the visitor back after they navigate away. */
      if (currentLocationKey.current !== location.key) return;
      navigate(buildAgentShareVisitorPath(slugOrId, createdTopicId), { replace: true });
    },
    selectTopic: (nextTopicId?: string) => {
      navigate(buildAgentShareVisitorPath(slugOrId, nextTopicId));
    },
    topicId,
  };
};
