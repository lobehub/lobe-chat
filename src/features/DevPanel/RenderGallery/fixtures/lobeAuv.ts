'use client';

import { AuvApiName, AuvIdentifier } from '@lobechat/builtin-tool-auv';

import { defineFixtures, variants } from './_helpers';

/** AUV command examples for the gallery's streaming, loading, result, and failure modes. */
export const lobeAuv = defineFixtures({
  identifier: AuvIdentifier,
  fixtures: {
    [AuvApiName.runCommand]: variants([
      {
        args: { argv: ['invoke', 'display.list'] },
        label: 'List displays',
        partialArgs: { argv: ['invoke', 'display.'] },
        pluginState: {
          argv: ['invoke', 'display.list', '--json'],
          output: { displays: [{ id: 'display-1', name: 'Built-in display' }] },
        },
      },
      {
        args: { argv: ['invoke', '--help'] },
        label: 'Command help',
        pluginState: { argv: ['invoke', '--help'], output: 'Available commands: display.list' },
      },
      {
        args: {},
        label: 'Waiting for arguments',
        partialArgs: {},
      },
      {
        args: { argv: ['invoke', 'display.capture'] },
        label: 'Capture permission denied',
        pluginError: {
          message: 'Screen recording permission is required to capture this display.',
          type: 'PluginServerError',
        },
      },
      {
        args: {
          argv: [
            'invoke',
            'display.capture',
            '--help',
            'Long argument with spaces and "quotes" to preview clipping inside a narrow tool header.',
          ],
        },
        label: 'Long arguments',
      },
    ]),
  },
});
