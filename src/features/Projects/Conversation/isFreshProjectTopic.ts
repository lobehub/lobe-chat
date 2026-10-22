/**
 * A topic the route points at that the project list doesn't have yet, but the
 * chat store does: the first send of a blank project conversation moves the
 * route before the list catches up. Only a topic born in this project counts —
 * another project's cached topic must still read as not found here.
 */
export const isFreshProjectTopic = (params: {
  listed: boolean;
  projectId: string | undefined;
  storedTopic: { projectId?: string | null } | undefined;
  topicId: string | undefined;
}) =>
  !!params.topicId &&
  !params.listed &&
  !!params.storedTopic?.projectId &&
  params.storedTopic.projectId === params.projectId;
