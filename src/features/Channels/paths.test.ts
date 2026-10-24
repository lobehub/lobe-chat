import { describe, expect, it } from 'vitest';

import { groupChannelPath, matchGroupChannel } from './paths';

describe('groupChannelPath', () => {
  it('builds the landing, channel and thread paths under a group', () => {
    expect(groupChannelPath('grp_1')).toBe('/group/grp_1/channel');
    expect(groupChannelPath('grp_1', 'chn_1')).toBe('/group/grp_1/channel/chn_1');
    expect(groupChannelPath('grp_1', 'chn_1', 'cht_1')).toBe(
      '/group/grp_1/channel/chn_1?thread=cht_1',
    );
  });
});

describe('matchGroupChannel', () => {
  it.each([
    ['/group/grp_1/channel', null],
    ['/group/grp_1/channel/', null],
    ['/group/grp_1/channel/chn_1', 'chn_1'],
    ['/acme/group/grp_1/channel/chn_1', 'chn_1'],
  ])('reads %s as the Channel tab', (pathname, expected) => {
    expect(matchGroupChannel(pathname)).toBe(expected);
  });

  it.each(['/group/grp_1', '/group/grp_1/tpc_1', '/group/grp_1/profile', '/channels/chn_1'])(
    'treats %s as outside the Channel tab',
    (pathname) => {
      expect(matchGroupChannel(pathname)).toBeUndefined();
    },
  );
});
