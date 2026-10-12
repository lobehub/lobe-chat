import type { BuiltinServerRuntimeOutput } from '@lobechat/types';

import type { ActivatedToolInfo, ActivateSkillParams, ActivateToolsParams } from '../types';

export interface ToolManifestInfo {
  apiDescriptions: Array<{ description: string; name: string }>;
  avatar?: string;
  identifier: string;
  name: string;
  systemRole?: string;
}

export interface ActivatorRuntimeService {
  activateSkill?: (args: ActivateSkillParams) => Promise<BuiltinServerRuntimeOutput>;
  /**
   * Why an identifier that exists is withheld from this run, if the host knows.
   * A bare "Not found" for a tool the model has seen before reads as a typo, so
   * it retries instead of telling the user what they can change.
   */
  explainNotFound?: (identifier: string) => string | undefined;
  getActivatedToolIds: () => string[];
  getToolManifests: (identifiers: string[]) => Promise<ToolManifestInfo[]>;
  markActivated: (identifiers: string[]) => void;
}

export interface ActivatorExecutionRuntimeOptions {
  service: ActivatorRuntimeService;
}

/** Same separator the tool-call wire names use (`identifier____apiName`). */
const TOOL_NAME_SEPARATOR = '____';

/**
 * Models call `activateTools` with names copied from what they can see: the
 * wire names in `tools[]` (`identifier____apiName`, possibly with an
 * `MD5HASH_…` segment from long-name compression) or a bare API name
 * (`activateTools`) — not the plugin-level identifier the manifest map is
 * keyed by. The tool-call parse path (`ToolNameResolver`) understands all
 * three; activation previously accepted only the bare identifier and answered
 * "Not found" for the platform's own naming, so the model retried the exact
 * same call until it vented (e.g. `lobe-web-browsing____search` with
 * `lobe-web-browsing` enabled and discoverable).
 *
 * Resolve each requested name against the run's discovery manifests before
 * the not-found fallbacks. Unresolvable names pass through unchanged so the
 * existing skill fallback and error semantics stay intact.
 */
const resolveActivationIdentifier = (
  requested: string,
  manifests: ToolManifestInfo[],
): string | undefined => {
  const byApiName = new Map<string, string[]>();
  const byWireName = new Map<string, string>();

  for (const manifest of manifests) {
    for (const api of manifest.apiDescriptions) {
      const matches = byApiName.get(api.name);
      if (matches) matches.push(manifest.identifier);
      else byApiName.set(api.name, [manifest.identifier]);
      // The activator manifest is `type: 'builtin'`, the default in
      // `ToolNameResolver.generate`, so the wire name never carries a type
      // segment; length compression does not apply at these lengths either.
      if (!byWireName.has(`${manifest.identifier}${TOOL_NAME_SEPARATOR}${api.name}`)) {
        byWireName.set(
          `${manifest.identifier}${TOOL_NAME_SEPARATOR}${api.name}`,
          manifest.identifier,
        );
      }
    }
  }

  // Exact wire name — the common case: the model copies the name it was
  // offered (or a compressed variant of it) straight into `identifiers`.
  const wireMatch = byWireName.get(requested);
  if (wireMatch) return wireMatch;

  // Wire name with an MD5-compressed api segment (`prefix____MD5HASH_…`):
  // the hash cannot be inverted from the manifest list, but activation is
  // plugin-level, so resolving to the identifier prefix is still the tool the
  // model asked for — and the prefix is manifest-map-scoped, so no wall is
  // bypassed. Bare names stay conservative: only a unique API match resolves.
  const separatorIndex = requested.indexOf(TOOL_NAME_SEPARATOR);
  if (separatorIndex > 0) {
    const prefix = requested.slice(0, separatorIndex);
    if (manifests.some((m) => m.identifier === prefix)) return prefix;
  }

  const apiMatches = byApiName.get(requested);
  if (apiMatches?.length === 1) return apiMatches[0];

  return undefined;
};

export class ActivatorExecutionRuntime {
  private service: ActivatorRuntimeService;

  constructor(options: ActivatorExecutionRuntimeOptions) {
    this.service = options.service;
  }

  async activateSkill(args: ActivateSkillParams): Promise<BuiltinServerRuntimeOutput> {
    if (!this.service.activateSkill) {
      return {
        content: 'Skill activation is not available.',
        success: false,
      };
    }

    return this.service.activateSkill(args);
  }

  async activateTools(args: ActivateToolsParams): Promise<BuiltinServerRuntimeOutput> {
    const { identifiers } = args;

    if (!identifiers || identifiers.length === 0) {
      return {
        content: 'No tool identifiers provided. Please specify which tools to activate.',
        success: false,
      };
    }

    try {
      const alreadyActive = this.service.getActivatedToolIds();

      // Wire names (`identifier____apiName`) and bare API names resolve to the
      // plugin-level identifier the manifest map is keyed by — mirrored from
      // the tool-call parse path so both entrances accept the same names.
      const discoveryManifests = await this.service.getToolManifests(
        // The map lookup is by plugin identifier: a wire name misses it, so
        // probe with the `____`-prefixes too and let the resolver match.
        identifiers.flatMap((id) => {
          const prefix = id.slice(0, id.indexOf(TOOL_NAME_SEPARATOR));
          return prefix && prefix !== id ? [id, prefix] : [id];
        }),
      );
      // Deduplicate after resolution: two wire names of the same plugin
      // (`lobe-web-browsing____search`, `…____crawlSinglePage`) both resolve
      // to the plugin identifier, and duplicate entries would surface as
      // duplicate manifests (and duplicate React keys) downstream.
      const resolvedIdentifiers = [
        ...new Set(
          identifiers.map((id) => resolveActivationIdentifier(id, discoveryManifests) ?? id),
        ),
      ];

      const toActivate: string[] = [];
      const alreadyActiveList: string[] = [];

      for (const id of resolvedIdentifiers) {
        if (alreadyActive.includes(id)) {
          alreadyActiveList.push(id);
        } else {
          toActivate.push(id);
        }
      }

      // Fetch manifests for tools to activate
      const manifests = await this.service.getToolManifests(toActivate);

      const foundIdentifiers = new Set(manifests.map((m) => m.identifier));
      const notFoundAsTools = toActivate.filter((id) => !foundIdentifiers.has(id));

      // Fallback: try activating not-found identifiers as skills
      const activatedSkillResults: BuiltinServerRuntimeOutput[] = [];
      const notFound: string[] = [];

      if (notFoundAsTools.length > 0 && this.service.activateSkill) {
        for (const id of notFoundAsTools) {
          try {
            const skillResult = await this.service.activateSkill({ name: id });
            if (skillResult.success) {
              activatedSkillResults.push(skillResult);
            } else {
              notFound.push(id);
            }
          } catch {
            notFound.push(id);
          }
        }
      } else {
        notFound.push(...notFoundAsTools);
      }

      const activatedTools: ActivatedToolInfo[] = manifests.map((m) => ({
        apiCount: m.apiDescriptions.length,
        avatar: m.avatar,
        identifier: m.identifier,
        name: m.name,
      }));

      // Mark newly activated tools
      if (manifests.length > 0) {
        this.service.markActivated(manifests.map((m) => m.identifier));
      }

      // Build response content
      const parts: string[] = [];

      if (activatedTools.length > 0) {
        // Activation state flows through `state.activatedTools` and gets the
        // manifest (systemRole + API schemas) injected into the system prompt
        // from the next LLM call onwards, so the result only needs to list the
        // newly callable APIs — returning the full docs here would double-carry
        // them in every subsequent payload.
        const apiNames = manifests.flatMap((manifest) =>
          manifest.apiDescriptions.length > 0
            ? manifest.apiDescriptions.map((api) => `${manifest.identifier}.${api.name}`)
            : [manifest.identifier],
        );
        parts.push(`Successfully activated tools: ${apiNames.join(', ')}.`);
        parts.push('Usage instructions for the activated items are in the system prompt.');
      }

      if (activatedSkillResults.length > 0) {
        for (const skillResult of activatedSkillResults) {
          parts.push(skillResult.content);
        }
      }

      if (alreadyActiveList.length > 0) {
        parts.push(`\nAlready active: ${alreadyActiveList.join(', ')}`);
      }

      const unexplained: string[] = [];
      for (const id of notFound) {
        const explanation = this.service.explainNotFound?.(id);
        if (explanation) parts.push(`\nNot available: ${id}. ${explanation}`);
        else unexplained.push(id);
      }

      if (unexplained.length > 0) {
        parts.push(`\nNot found: ${unexplained.join(', ')}`);
      }

      return {
        content: parts.join('\n'),
        state: {
          activatedSkills: activatedSkillResults.map((r) => r.state),
          activatedTools,
          alreadyActive: alreadyActiveList,
          notFound,
        },
        success: true,
      };
    } catch (e) {
      return {
        content: `Failed to activate tools: ${(e as Error).message}`,
        success: false,
      };
    }
  }
}
