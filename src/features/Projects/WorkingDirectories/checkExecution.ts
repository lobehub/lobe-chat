import type { ChatTopic } from '@lobechat/types';
import { t } from 'i18next';

import { projectWorkingDirectoryService } from '@/services/projectWorkingDirectory';
import { findProjectDirectory } from '@/store/projectWorkingDirectory';

/**
 * UI preflight for a project-directory conversation, run before the composer is
 * cleared so a rejected send keeps the user's text and uploads.
 *
 * Checks the binding so a directory that was deleted, unlinked or made
 * read-only while the conversation was open still rejects up front. The row is
 * read from the sidebar's directory replica when it is loaded — a network
 * resolve here sat in front of every send — and only a cold replica resolves
 * from the DB. The replica does not carry the environment's enabled state;
 * the runtime revalidates the full binding before every execution, and a
 * rejected dispatch restores the composer itself. It deliberately does NOT
 * probe the device with `deviceService.statPath`: whether the directory still
 * exists on the device is discovered by the dispatch that follows.
 */
export async function checkProjectExecution(topic: ChatTopic | undefined, gatewayEnabled: boolean) {
  if (!topic?.projectWorkingDirectoryId) return;
  if (!gatewayEnabled) throw new Error(t('topics.gatewayUnavailable', { ns: 'project' }));

  const directory = findProjectDirectory(topic.projectWorkingDirectoryId);
  if (!directory) {
    // Throws for a missing, disabled or read-only directory.
    await projectWorkingDirectoryService.resolve(topic.projectWorkingDirectoryId);
    return;
  }
  // Same messages as the server-side resolve the cold path surfaces.
  if (!directory.instanceId || !directory.environmentId)
    throw new Error('Link this directory to an environment before starting work');
  if (directory.permission !== 'readWrite') throw new Error('This directory is read-only');
}
