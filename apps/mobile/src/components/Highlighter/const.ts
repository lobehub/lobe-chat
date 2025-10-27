import langBash from '@shikijs/langs/bash';
import langC from '@shikijs/langs/c';
import langCpp from '@shikijs/langs/cpp';
import langCsharp from '@shikijs/langs/csharp';
import langCss from '@shikijs/langs/css';
import langDart from '@shikijs/langs/dart';
import langDiff from '@shikijs/langs/diff';
import langDockerfile from '@shikijs/langs/dockerfile';
import langGo from '@shikijs/langs/go';
import langGraphql from '@shikijs/langs/graphql';
import langHtml from '@shikijs/langs/html';
import langJava from '@shikijs/langs/java';
import langJavascript from '@shikijs/langs/javascript';
import langJson from '@shikijs/langs/json';
import langJsx from '@shikijs/langs/jsx';
import langKotlin from '@shikijs/langs/kotlin';
import langLatex from '@shikijs/langs/latex';
import langLess from '@shikijs/langs/less';
import langLua from '@shikijs/langs/lua';
import langMarkdown from '@shikijs/langs/markdown';
import langNginx from '@shikijs/langs/nginx';
import langObjectiveC from '@shikijs/langs/objective-c';
import langPerl from '@shikijs/langs/perl';
import langPhp from '@shikijs/langs/php';
import langPowershell from '@shikijs/langs/powershell';
import langPython from '@shikijs/langs/python';
import langR from '@shikijs/langs/r';
import langRuby from '@shikijs/langs/ruby';
import langRust from '@shikijs/langs/rust';
import langSass from '@shikijs/langs/sass';
import langScala from '@shikijs/langs/scala';
import langScss from '@shikijs/langs/scss';
import langShell from '@shikijs/langs/shellscript';
import langSql from '@shikijs/langs/sql';
import langSwift from '@shikijs/langs/swift';
import langToml from '@shikijs/langs/toml';
import langTsx from '@shikijs/langs/tsx';
import langTypescript from '@shikijs/langs/typescript';
import langVue from '@shikijs/langs/vue';
import langXml from '@shikijs/langs/xml';
import langYaml from '@shikijs/langs/yaml';
import { uniq } from 'lodash-es';
import { bundledLanguagesInfo } from 'shiki';

// Application-level constants
export const FALLBACK_LANG = 'javascript'; // Fallback to javascript if language not found

/**
 * Get the code language by input string
 * Matches language id or aliases
 * @param input - The input language string
 * @returns The matched language id or 'plaintext'
 */
export const getCodeLanguageByInput = (input: string): string => {
  if (!input) {
    return FALLBACK_LANG;
  }
  const inputLang = input.toLocaleLowerCase();

  const matchLang = bundledLanguagesInfo.find(
    (lang) => lang.id === inputLang || lang.aliases?.includes(inputLang),
  );
  return matchLang?.id || FALLBACK_LANG;
};

/**
 * Get the display name for a language
 * @param input - The input language string
 * @returns The display name (e.g., 'JavaScript', 'Python')
 */
export const getCodeLanguageDisplayName = (input: string): string => {
  if (!input) {
    return 'Plaintext';
  }
  const inputLang = input.toLocaleLowerCase();

  const matchLang = bundledLanguagesInfo.find(
    (lang) => lang.id === inputLang || lang.aliases?.includes(inputLang),
  );
  return matchLang?.name || 'Plaintext';
};

export const supportedLanguages = [
  langBash,
  langC,
  langCpp,
  langCsharp,
  langCss,
  langDart,
  langDiff,
  langDockerfile,
  langGo,
  langGraphql,
  langHtml,
  langJava,
  langJavascript,
  langJson,
  langJsx,
  langKotlin,
  langLatex,
  langLess,
  langLua,
  langMarkdown,
  langNginx,
  langObjectiveC,
  langPerl,
  langPhp,
  langPowershell,
  langPython,
  langR,
  langRuby,
  langRust,
  langSass,
  langScala,
  langScss,
  langShell,
  langSql,
  langSwift,
  langToml,
  langTsx,
  langTypescript,
  langVue,
  langXml,
  langYaml,
];

export const supportedLanguageIds = uniq(
  supportedLanguages.flatMap((lang) => {
    // Language modules export an array of LanguageRegistration
    const grammars = Array.isArray(lang) ? lang : [lang];
    return grammars.map((g) => g.name);
  }),
).sort((a, b) => a.localeCompare(b));
