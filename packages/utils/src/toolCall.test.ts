import { PLUGIN_SCHEMA_API_MD5_PREFIX } from '@lobechat/const';

import { genToolCallShortMD5Hash, resolveHashedApiName } from './toolCall';

describe('resolveHashedApiName', () => {
  const mockManifest = {
    api: [
      { name: 'shortName' },
      { name: 'testcase-issue1065_-_sortValues' },
      { name: 'testcase-issue1065_-_calculateVolume' },
    ],
  };

  it('should return the original name if not hashed', () => {
    const apiName = 'normalApiName';
    const result = resolveHashedApiName(apiName, mockManifest);
    expect(result).toBe(apiName);
  });

  it('should return the original name if no manifest provided', () => {
    const hashedName = PLUGIN_SCHEMA_API_MD5_PREFIX + 'somehash';
    const result = resolveHashedApiName(hashedName);
    expect(result).toBe(hashedName);
  });

  it('should resolve hashed name back to original name', () => {
    const originalName = 'testcase-issue1065_-_sortValues';
    const md5Hash = genToolCallShortMD5Hash(originalName);
    const hashedName = PLUGIN_SCHEMA_API_MD5_PREFIX + md5Hash;
    
    const result = resolveHashedApiName(hashedName, mockManifest);
    expect(result).toBe(originalName);
  });

  it('should resolve hashed name for long API names', () => {
    const originalName = 'testcase-issue1065_-_calculateVolume';
    const md5Hash = genToolCallShortMD5Hash(originalName);
    const hashedName = PLUGIN_SCHEMA_API_MD5_PREFIX + md5Hash;
    
    const result = resolveHashedApiName(hashedName, mockManifest);
    expect(result).toBe(originalName);
  });

  it('should return hashed name if no matching API found', () => {
    const nonExistentHash = PLUGIN_SCHEMA_API_MD5_PREFIX + 'nonexistenthash';
    const result = resolveHashedApiName(nonExistentHash, mockManifest);
    expect(result).toBe(nonExistentHash);
  });

  it('should handle manifest without api property', () => {
    const hashedName = PLUGIN_SCHEMA_API_MD5_PREFIX + 'somehash';
    const result = resolveHashedApiName(hashedName, {});
    expect(result).toBe(hashedName);
  });
});