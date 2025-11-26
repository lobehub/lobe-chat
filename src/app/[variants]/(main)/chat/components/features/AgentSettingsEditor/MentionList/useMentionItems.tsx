import { IEditor, INSERT_MENTION_COMMAND } from '@lobehub/editor';
import { ToolNameResolver } from '@lobechat/context-engine';
import { apiPrompt, toolPrompt, type API } from '@lobechat/prompts';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import isEqual from 'fast-deep-equal';
import { useCallback, useMemo } from 'react';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { useStore } from '@/features/AgentSetting/store';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { globalAgentContextManager } from '@/utils/client/GlobalAgentContextManager';
import { hydrationPrompt } from '@/utils/promptTemplate';

import MentionDropdown from './MentionDropdown';
import { MentionListOption, MentionMetadata } from './types';

const toolNameResolver = new ToolNameResolver();

const buildApiList = (identifier: string, manifest?: LobeChatPluginManifest): API[] => {
  if (!manifest?.api) return [];

  return manifest.api.map((api) => ({
    desc: api.description || '',
    name: toolNameResolver.generate(identifier, api.name, manifest.type),
  }));
};

const hydrateSystemRole = (systemRole?: string) => {
  if (!systemRole) return '';

  return hydrationPrompt(systemRole, globalAgentContextManager.getContext());
};

const resolveInstructions = (
  metadata: MentionMetadata,
  manifest?: LobeChatPluginManifest,
  fallbackDesc?: string,
) => {
  if (metadata.instructions) return metadata.instructions;

  if (manifest?.systemRole) return hydrateSystemRole(manifest.systemRole);

  return metadata.description || fallbackDesc || pluginHelpers.getPluginDesc(manifest?.meta) || '';
};

const resolveApiName = (
  metadata: MentionMetadata,
  manifest: LobeChatPluginManifest | undefined,
  pluginId?: string,
  fallbackLabel?: string,
) => {
  if (metadata.identifier) return metadata.identifier;

  const sourceId = pluginId || manifest?.identifier || '';

  if (metadata.label) {
    return toolNameResolver.generate(sourceId, metadata.label, manifest?.type);
  }

  const firstApi = manifest?.api?.[0]?.name;

  if (firstApi) {
    return toolNameResolver.generate(sourceId, firstApi, manifest?.type);
  }

  return fallbackLabel;
};

const resolveApiDescription = (
  metadata: MentionMetadata,
  manifest: LobeChatPluginManifest | undefined,
  pluginId: string | undefined,
  apiName?: string,
) => {
  if (metadata.description) return metadata.description;

  if (!manifest?.api?.length || !apiName) return '';

  const sourceId = pluginId || manifest.identifier;
  const matched = manifest.api.find((api) => {
    const fullName = toolNameResolver.generate(sourceId, api.name, manifest.type);

    return fullName === apiName || api.name === apiName;
  });

  return matched?.description || '';
};

const useMentionOptions = () => {
  const installedTools = useToolStore(toolSelectors.metaList, isEqual);
  const toggleAgentPlugin = useStore((s) => s.toggleAgentPlugin);

  const baseItems = useMemo<MentionListOption[]>(() => {
    const state = useToolStore.getState();

    return installedTools.map((tool) => {
      const manifest = toolSelectors.getManifestById(tool.identifier)(state);
      const label = pluginHelpers.getPluginTitle(tool.meta) || tool.identifier;
      const description = pluginHelpers.getPluginDesc(tool.meta);
      const apis = buildApiList(manifest?.identifier || tool.identifier, manifest);

      const createMetadata = (): MentionMetadata => ({
        apis: apis.map((api) => ({ ...api })),
        description,
        identifier: tool.identifier,
        label,
        pluginType: manifest?.type,
        type: 'collection',
      });

      return {
        description,
        icon: (
          <PluginAvatar alt={label} avatar={pluginHelpers.getPluginAvatar(tool.meta)} size={20} />
        ),
        key: tool.identifier,
        label,
        metadata: createMetadata(),
        onSelect: (editor: IEditor) => {
          toggleAgentPlugin(tool.identifier, true);
          editor.dispatchCommand(INSERT_MENTION_COMMAND, {
            label,
            metadata: createMetadata() as unknown as Record<string, unknown>,
          });
        },
      };
    });
  }, [installedTools, toggleAgentPlugin]);

  const loadItems = useCallback(
    async (search: { leadOffset: number; matchingString: string; replaceableString: string } | null) => {
      const query = search?.matchingString?.toLowerCase() || '';

      if (!query) return baseItems;

      return baseItems.filter((item) => {
        const label = typeof item.label === 'string' ? item.label.toLowerCase() : '';
        const desc = item.description?.toLowerCase() || '';
        const key = typeof item.key === 'string' ? item.key.toLowerCase() : '';

        return label.includes(query) || desc.includes(query) || key.includes(query);
      });
    },
    [baseItems],
  );

  const mentionMarkdownWriter = useCallback((mention: any) => {
    const metadata = (mention?.metadata || {}) as MentionMetadata;
    const pluginId = metadata.pluginIdentifier || metadata.identifier;
    const state = useToolStore.getState();
    const manifest = pluginId ? toolSelectors.getManifestById(pluginId)(state) : undefined;

    if (metadata.type === 'api') {
      const apiName = resolveApiName(metadata, manifest, pluginId, mention?.label);
      const apiDescription = resolveApiDescription(metadata, manifest, pluginId, apiName);

      if (!apiName) return mention?.getTextContent?.() || '';

      return `\n${apiPrompt({ desc: apiDescription, name: apiName })}\n`;
    }

    const apis =
      metadata.apis?.length && metadata.apis.length > 0
        ? metadata.apis
        : buildApiList(pluginId || manifest?.identifier || '', manifest);

    const name =
      metadata.label ||
      pluginHelpers.getPluginTitle(manifest?.meta) ||
      pluginId ||
      mention?.label ||
      '';

    const instructions = resolveInstructions(metadata, manifest, metadata.description);

    const prompt = toolPrompt({
      apis: apis || [],
      identifier: pluginId || '',
      name,
      systemRole: instructions,
    });

    return `\n${prompt}\n`;
  }, []);

  return useMemo(
    () => ({
      fuseOptions: { keys: ['key', 'label', 'description'], threshold: 0.4 },
      items: loadItems,
      markdownWriter: mentionMarkdownWriter,
      renderComp: MentionDropdown,
    }),
    [loadItems, mentionMarkdownWriter],
  );
};

export default useMentionOptions;
