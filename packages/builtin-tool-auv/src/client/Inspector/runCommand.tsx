'use client';

import { RunCommandInspector } from '@lobechat/shared-tool-ui/inspectors';
import type { BuiltinInspectorProps } from '@lobechat/types';

import type { AuvRunCommandParams } from '../../types';

/**
 * Displays an AUV invocation using the shared command inspector.
 *
 * Use when:
 * - Rendering AUV tool calls in chat or the tool gallery.
 *
 * Expects:
 * - Final or streaming argv; result status is rendered by the enclosing tool header.
 *
 * Returns:
 * - A localized header and command chip, including while arguments stream.
 */
export const AuvRunCommandInspector = ({
  args,
  partialArgs,
  pluginState: _pluginState,
  ...props
}: BuiltinInspectorProps<Partial<AuvRunCommandParams>, unknown>) => {
  const argv = args?.argv ?? partialArgs?.argv;
  // This is display text, not shell input. Quoting preserves whitespace and empty arguments
  // so a typed text value is not mistaken for several separate CLI arguments.
  const command = argv?.length
    ? `auv ${argv.map((argument) => (/^[\w./:=+-]+$/.test(argument) ? argument : JSON.stringify(argument))).join(' ')}`
    : '';

  return (
    <RunCommandInspector
      {...props}
      args={{ command }}
      translationKey="builtins.lobe-auv.apiName.runCommand"
    />
  );
};
