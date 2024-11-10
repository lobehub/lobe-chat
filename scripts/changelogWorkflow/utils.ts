import { markdownToTxt } from 'markdown-to-txt';
import semver from 'semver';

export const removeDetailsTag = (changelog: string): string => {
  const detailsRegex: RegExp = /<details\b[^>]*>[\S\s]*?<\/details>/gi;
  return changelog.replaceAll(detailsRegex, '');
};

export const cleanVersion = (version: string): string => {
  return semver.clean(version) || version;
};

export const formatCategory = (category: string): string => {
  const cate = category.toLowerCase();
  switch (cate) {
    case 'bug fixes': {
      return 'fixes';
    }
    case 'styles': {
      return 'improvements';
    }
    case 'code refactoring': {
      return 'improvements';
    }
    case 'features': {
      return 'improvements';
    }
    default: {
      return '';
    }
  }
};

interface ChangelogEntry {
  children: {
    [category: string]: string[];
  };
  date: string;
  version: string;
}

export const formatChangelog = (changelog: string): ChangelogEntry[] => {
  const cleanedChangelog = removeDetailsTag(changelog);
  const input = markdownToTxt(cleanedChangelog);
  const versions = input.split(/Version&nbsp;|Version /).slice(1);

  const output: ChangelogEntry[] = [];

  for (const version of versions) {
    const lines = version.trim().split('\n');
    const versionNumber = lines[0].trim();
    const date = lines[2].replace('Released on ', '').trim();

    const entry: ChangelogEntry = {
      children: {},
      date: date,
      version: cleanVersion(versionNumber),
    };

    let currentCategory = '';
    let skipSection = false;

    for (let i = 3; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      if (/^\p{Emoji}/u.test(line)) {
        currentCategory = formatCategory(line.replace(/^\p{Emoji} /u, ''));
        if (!currentCategory) continue;
        entry.children[currentCategory] = [];
        skipSection = false;
      } else if (line.startsWith('misc:') && !skipSection && currentCategory) {
        entry.children[currentCategory].push(line.replace('misc:', '').trim());
      }
    }

    // Remove empty categories
    for (const category in entry.children) {
      if (entry.children[category].length === 0) {
        delete entry.children[category];
      }
    }

    output.push(entry);
  }

  return output;
};

export const mergeAndSortVersions = (oldVersions: any, newVersions: any) => {
  const mergedVersions = [...oldVersions];

  for (const newVersion of newVersions) {
    const existingIndex = mergedVersions.findIndex(
      (v) => cleanVersion(v.version) === cleanVersion(newVersion.version),
    );
    if (existingIndex === -1) {
      const insertIndex = mergedVersions.findIndex(
        (v) => semver.compare(cleanVersion(newVersion.version), cleanVersion(v.version)) > 0,
      );
      if (insertIndex === -1) {
        mergedVersions.push(newVersion);
      } else {
        mergedVersions.splice(insertIndex, 0, newVersion);
      }
    }
  }

  return mergedVersions;
};
