import { ChatPluginPayload } from '@lobechat/types';
import { Highlighter } from '@lobehub/ui';
import { memo, useEffect, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginRender from '@/features/PluginsUI/Render';

import Arguments from './Arguments';

interface CustomRenderProps {
  content: string;
  id: string;
  plugin?: ChatPluginPayload;
  pluginState?: any;
  requestArgs?: string;
  setShowPluginRender: (value: boolean) => void;
  showPluginRender: boolean;
}

/**
 * Custom Render for Group Messages
 *
 * Group messages are already completed, so:
 * - No loading state needed
 * - No edit/re-run functionality
 * - Results are directly available in content prop
 */
const CustomRender = memo<CustomRenderProps>(
  ({ id, content, pluginState, plugin, requestArgs, showPluginRender, setShowPluginRender }) => {
    // Determine if plugin UI should be shown based on plugin type
    useEffect(() => {
      if (!plugin?.type) return;
      setShowPluginRender(plugin.type !== 'default');
    }, [plugin?.type, setShowPluginRender]);

    // Parse and display result content
    const { data, language } = useMemo(() => {
      try {
        const parsed = JSON.parse(content || '');
        // If parsed result is a string, return it directly
        if (typeof parsed === 'string') {
          return { data: parsed, language: 'plaintext' };
        }
        return { data: JSON.stringify(parsed, null, 2), language: 'json' };
      } catch {
        return { data: content || '', language: 'plaintext' };
      }
    }, [content]);

    // Show plugin custom UI if applicable
    if (showPluginRender) {
      return (
        <Flexbox gap={12} id={id} width={'100%'}>
          <PluginRender
            arguments={plugin?.arguments}
            content={content}
            id={id}
            identifier={plugin?.identifier}
            loading={false}
            payload={plugin}
            pluginState={pluginState}
            type={plugin?.type}
          />
        </Flexbox>
      );
    }

    // Default render: show arguments and result
    return (
      <Flexbox gap={12} id={id} width={'100%'}>
        <Arguments arguments={requestArgs} />
        {content && (
          <Highlighter
            language={language}
            style={{ maxHeight: 200, overflow: 'scroll', width: '100%' }}
            variant={'outlined'}
          >
            {data}
          </Highlighter>
        )}
      </Flexbox>
    );
  },
);

CustomRender.displayName = 'GroupCustomRender';

export default CustomRender;
