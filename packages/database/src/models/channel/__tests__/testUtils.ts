import type { ChannelMemberConfig, ChannelMemberRole } from '@lobechat/types';
import { eq, inArray } from 'drizzle-orm';

import {
  channelJobs,
  channelMembers,
  channelRuns,
  devices,
  users,
  workspaces,
} from '../../../schemas';
import type { LobeChatDatabase } from '../../../type';
import { ChannelModel } from '..';

export const nativeConfig: ChannelMemberConfig = {
  model: 'gpt-5',
  provider: 'openai',
  runtime: 'native',
};

/** `device-1` is public in the fixture workspace; any other device id needs a grant. */
export const deviceConfig = (
  workingDirectory = '/repo',
  deviceId = 'device-1',
  deviceOwnerId?: string,
): ChannelMemberConfig => ({
  deviceId,
  deviceOwnerId,
  model: 'gpt-5',
  provider: 'openai',
  runtime: 'codex',
  workingDirectory,
});

export const lease = { leaseMs: 60_000, leaseOwner: 'worker-1' };

/**
 * Users and a workspace for one test file. Each file passes its own prefix so files can
 * share a server database.
 */
export const createChannelFixture = (db: LobeChatDatabase, prefix: string) => {
  const ownerId = `${prefix}-owner`;
  const memberId = `${prefix}-member`;
  const workspaceId = `${prefix}-workspace`;
  const userIds = [ownerId, memberId];

  const setup = async () => {
    await db.insert(users).values([
      { fullName: 'Olivia Owner', id: ownerId },
      { id: memberId, username: 'mia' },
    ]);
    await db
      .insert(workspaces)
      .values({ id: workspaceId, name: 'Workspace', primaryOwnerId: ownerId, slug: workspaceId });
    await db.insert(devices).values({
      deviceId: 'device-1',
      identitySource: 'fallback',
      userId: ownerId,
      visibility: 'public',
      workspaceId,
    });
  };

  const cleanup = async () => {
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
    await db.delete(users).where(inArray(users.id, userIds));
  };

  const addAgent = async (channelId: string, name: string, config = nativeConfig) => {
    const [agent] = await db
      .insert(channelMembers)
      .values({ actorType: 'agent', channelId, config, name })
      .returning();
    return agent;
  };

  const addPerson = async (channelId: string, userId: string, role: ChannelMemberRole) => {
    const [person] = await db
      .insert(channelMembers)
      .values({ actorType: 'user', channelId, lastReadSequence: 0, role, userId })
      .returning();
    return person;
  };

  /** A workspace channel owned by `ownerId`, with `memberId` as a plain member. */
  const createTeamChannel = async (title = 'Team') => {
    const asOwner = new ChannelModel(db, ownerId, workspaceId);
    const { channel, member: owner } = await asOwner.create({ title });
    const member = await addPerson(channel.id, memberId, 'member');

    return {
      asMember: new ChannelModel(db, memberId, workspaceId),
      asOwner,
      channel,
      member,
      owner,
    };
  };

  return { addAgent, addPerson, cleanup, createTeamChannel, memberId, ownerId, setup, workspaceId };
};

export const jobsOf = (db: LobeChatDatabase, messageId: string) =>
  db.select().from(channelJobs).where(eq(channelJobs.messageId, messageId));

export const runById = async (db: LobeChatDatabase, runId: string) => {
  const [run] = await db.select().from(channelRuns).where(eq(channelRuns.id, runId));
  return run;
};
