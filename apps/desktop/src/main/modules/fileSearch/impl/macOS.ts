import { exec, spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';

import { FileResult, SearchOptions } from '@/types/fileSearch';

import { FileSearchImpl } from '../type';

const execPromise = promisify(exec);
const statPromise = promisify(fs.stat);

export class MacOSSearchServiceImpl extends FileSearchImpl {
  /**
   * Perform file search
   * @param options Search options
   * @returns Promise of search result list
   */
  async search(options: SearchOptions): Promise<FileResult[]> {
    try {
      const command = this.buildSearchCommand(options);
      console.log('Executing command:', command);

      // If live update is needed, use the callback method
      if (options.liveUpdate) {
        return this.executeLiveSearch(command, options);
      }

      // Otherwise perform a regular search
      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        console.warn('Search warning:', stderr);
      }

      // Parse and process results
      return this.processSearchResults(stdout, options);
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Check search service status
   * @returns Promise indicating if Spotlight service is available
   */
  async checkSearchServiceStatus(): Promise<boolean> {
    return this.checkSpotlightStatus();
  }

  /**
   * Update search index
   * @param path Optional specified path
   * @returns Promise indicating operation success
   */
  async updateSearchIndex(path?: string): Promise<boolean> {
    return this.updateSpotlightIndex(path);
  }

  /**
   * Build mdfind command string
   * @param options Search options
   * @returns Complete command string
   */
  private buildSearchCommand(options: SearchOptions): string {
    // Basic command
    let command = 'mdfind';

    // Add options
    const mdFindOptions: string[] = [];

    // macOS mdfind doesn't support -limit parameter, we'll limit results in post-processing

    // Search in specific directory
    if (options.onlyIn) {
      mdFindOptions.push(`-onlyin "${options.onlyIn}"`);
    }

    // Live update
    if (options.liveUpdate) {
      mdFindOptions.push('-live');
    }

    // Detailed metadata
    if (options.detailed) {
      mdFindOptions.push(
        '-attr kMDItemDisplayName kMDItemContentType kMDItemKind kMDItemFSSize kMDItemFSCreationDate kMDItemFSContentChangeDate',
      );
    }

    // Build query expression
    let queryExpression = '';

    // Basic query
    if (options.query) {
      // If the query string doesn't use Spotlight query syntax (doesn't contain kMDItem properties),
      // treat it as plain text search
      if (!options.query.includes('kMDItem')) {
        queryExpression = `"${options.query.replaceAll('"', '\\"')}"`;
      } else {
        queryExpression = options.query;
      }
    }

    // File content search
    if (options.contentContains) {
      if (queryExpression) {
        queryExpression = `${queryExpression} && kMDItemTextContent == "*${options.contentContains}*"cd`;
      } else {
        queryExpression = `kMDItemTextContent == "*${options.contentContains}*"cd`;
      }
    }

    // File type filtering
    if (options.fileTypes && options.fileTypes.length > 0) {
      const typeConditions = options.fileTypes
        .map((type) => `kMDItemContentType == "${type}"`)
        .join(' || ');
      if (queryExpression) {
        queryExpression = `${queryExpression} && (${typeConditions})`;
      } else {
        queryExpression = `(${typeConditions})`;
      }
    }

    // Date filtering - Modified date
    if (options.modifiedAfter || options.modifiedBefore) {
      let dateCondition = '';

      if (options.modifiedAfter) {
        const dateString = options.modifiedAfter.toISOString().split('T')[0];
        dateCondition += `kMDItemFSContentChangeDate >= $time.iso(${dateString})`;
      }

      if (options.modifiedBefore) {
        if (dateCondition) dateCondition += ' && ';
        const dateString = options.modifiedBefore.toISOString().split('T')[0];
        dateCondition += `kMDItemFSContentChangeDate <= $time.iso(${dateString})`;
      }

      if (queryExpression) {
        queryExpression = `${queryExpression} && (${dateCondition})`;
      } else {
        queryExpression = dateCondition;
      }
    }

    // Date filtering - Creation date
    if (options.createdAfter || options.createdBefore) {
      let dateCondition = '';

      if (options.createdAfter) {
        const dateString = options.createdAfter.toISOString().split('T')[0];
        dateCondition += `kMDItemFSCreationDate >= $time.iso(${dateString})`;
      }

      if (options.createdBefore) {
        if (dateCondition) dateCondition += ' && ';
        const dateString = options.createdBefore.toISOString().split('T')[0];
        dateCondition += `kMDItemFSCreationDate <= $time.iso(${dateString})`;
      }

      if (queryExpression) {
        queryExpression = `${queryExpression} && (${dateCondition})`;
      } else {
        queryExpression = dateCondition;
      }
    }

    // Combine complete command
    if (mdFindOptions.length > 0) {
      command += ' ' + mdFindOptions.join(' ');
    }

    // Finally add query expression
    command += ` ${queryExpression}`;

    return command;
  }

  /**
   * Execute live search, returns initial results and sets callback
   * @param command mdfind command
   * @param options Search options
   * @returns Promise of initial search results
   */
  private executeLiveSearch(command: string, options: SearchOptions): Promise<FileResult[]> {
    return new Promise((resolve, reject) => {
      // Split command and arguments
      const [cmd, ...args] = command.split(' ');

      // Use spawn instead of exec to get stream output
      const childProcess = spawn(cmd, args);

      let stdoutData = '';
      let initialResultsProcessed = false;

      childProcess.stdout.on('data', async (data) => {
        const output = data.toString();
        stdoutData += output;

        // Process and parse for the first batch of results
        if (!initialResultsProcessed && output.includes('\n')) {
          const results = await this.processSearchResults(stdoutData, options);
          initialResultsProcessed = true;
          resolve(results);

          // Later results are sent via events, but this needs appropriate event mechanism in Electron
          // Here simply display updates in the console
          console.log('Search results updated, new total:', results.length);
        }
      });

      childProcess.stderr.on('data', (data) => {
        console.warn('Live search warning:', data.toString());
      });

      childProcess.on('error', (error) => {
        reject(new Error(`Live search failed: ${error.message}`));
      });

      childProcess.on('close', (code) => {
        if (code !== 0 && !initialResultsProcessed) {
          reject(new Error(`Live search process exited with code ${code}`));
        }
      });

      // Timeout protection, ensure results are always returned
      setTimeout(() => {
        if (!initialResultsProcessed) {
          this.processSearchResults(stdoutData, options).then(resolve).catch(reject);
          initialResultsProcessed = true;
        }
      }, 5000);
    });
  }

  /**
   * Process search results
   * @param stdout Command output
   * @param options Search options
   * @returns Formatted file result list
   */
  private async processSearchResults(
    stdout: string,
    options: SearchOptions,
  ): Promise<FileResult[]> {
    // Split lines and filter empty lines
    const lines = stdout.split('\n').filter((line) => line.trim().length > 0);

    // Create a result object for each file path
    const resultPromises = lines.map(async (filePath) => {
      try {
        // Get file information
        const stats = await statPromise(filePath);

        // Create basic result object
        const result: FileResult = {
          createdTime: stats.birthtime,
          isDirectory: stats.isDirectory(),
          lastAccessTime: stats.atime,
          metadata: {},
          modifiedTime: stats.mtime,
          name: path.basename(filePath),
          path: filePath,
          size: stats.size,
          type: path.extname(filePath).toLowerCase().replace('.', ''),
        };

        // If detailed information is needed, get additional metadata
        if (options.detailed) {
          result.metadata = await this.getDetailedMetadata(filePath);
        }

        // Determine content type
        result.contentType = this.determineContentType(result.name, result.type);

        return result;
      } catch (error) {
        console.warn(`Error processing file ${filePath}:`, error);
        // Return partial information, even if unable to get complete file stats
        return {
          contentType: 'unknown',
          createdTime: new Date(),
          isDirectory: false,
          lastAccessTime: new Date(),
          modifiedTime: new Date(),
          name: path.basename(filePath),
          path: filePath,
          size: 0,
          type: path.extname(filePath).toLowerCase().replace('.', ''),
        };
      }
    });

    // Wait for all file information processing to complete
    let results = await Promise.all(resultPromises);

    // Sort results
    if (options.sortBy) {
      results = this.sortResults(results, options.sortBy, options.sortDirection);
    }

    // Apply limit here as mdfind doesn't support -limit parameter
    if (options.limit && options.limit > 0 && results.length > options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Get detailed metadata for a file
   * @param filePath File path
   * @returns Metadata object
   */
  private async getDetailedMetadata(filePath: string): Promise<Record<string, any>> {
    try {
      // Use mdls command to get all metadata
      const { stdout } = await execPromise(`mdls "${filePath}"`);

      // Parse mdls output
      const metadata: Record<string, any> = {};
      const lines = stdout.split('\n');

      let currentKey = '';
      let isMultilineValue = false;
      let multilineValue: string[] = [];

      for (const line of lines) {
        if (isMultilineValue) {
          if (line.includes(')')) {
            // Multiline value ends
            multilineValue.push(line.trim());
            metadata[currentKey] = multilineValue.join(' ');
            isMultilineValue = false;
            multilineValue = [];
          } else {
            // Continue collecting multiline value
            multilineValue.push(line.trim());
          }
          continue;
        }

        const match = line.match(/^(\w+)\s+=\s+(.*)$/);
        if (match) {
          currentKey = match[1];
          const value = match[2].trim();

          // Check for multiline value start
          if (value.includes('(') && !value.includes(')')) {
            isMultilineValue = true;
            multilineValue = [value];
          } else {
            // Process single line value
            metadata[currentKey] = this.parseMetadataValue(value);
          }
        }
      }

      return metadata;
    } catch (error) {
      console.warn(`Error getting metadata for ${filePath}:`, error);
      return {};
    }
  }

  /**
   * Parse metadata value
   * @param value Metadata raw value string
   * @returns Parsed value
   */
  private parseMetadataValue(input: string): any {
    let value = input;
    // Remove quotes from mdls output
    if (value.startsWith('"') && value.endsWith('"')) {
      // eslint-disable-next-line unicorn/prefer-string-slice
      value = value.substring(1, value.length - 1);
    }

    // Handle special values
    if (value === '(null)') return null;
    if (value === 'Yes' || value === 'true') return true;
    if (value === 'No' || value === 'false') return false;

    // Try to parse date (format like "2023-05-16 14:30:45 +0000")
    const dateMatch = value.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4})$/);
    if (dateMatch) {
      try {
        return new Date(value);
      } catch {
        // If date parsing fails, return original string
        return value;
      }
    }

    // Try to parse number
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }

    // Default return string
    return value;
  }

  /**
   * Determine file content type
   * @param fileName File name
   * @param extension File extension
   * @returns Content type description
   */
  private determineContentType(fileName: string, extension: string): string {
    // Map common file extensions to content types
    const typeMap: Record<string, string> = {
      '7z': 'archive',
      'aac': 'audio',
      // Others
      'app': 'application',
      'avi': 'video',
      'c': 'code',
      'cpp': 'code',
      'css': 'code',
      'dmg': 'disk-image',
      'doc': 'document',
      'docx': 'document',
      'gif': 'image',
      'gz': 'archive',
      'heic': 'image',
      'html': 'code',
      'iso': 'disk-image',
      'java': 'code',
      'jpeg': 'image',
      // Images
      'jpg': 'image',
      // Code
      'js': 'code',
      'json': 'code',
      'mkv': 'video',
      'mov': 'video',
      // Audio
      'mp3': 'audio',
      // Video
      'mp4': 'video',
      'ogg': 'audio',
      // Documents
      'pdf': 'document',
      'png': 'image',
      'ppt': 'presentation',
      'pptx': 'presentation',
      'py': 'code',
      'rar': 'archive',
      'rtf': 'text',
      'svg': 'image',
      'swift': 'code',
      'tar': 'archive',
      'ts': 'code',
      'txt': 'text',
      'wav': 'audio',
      'webp': 'image',
      'xls': 'spreadsheet',
      'xlsx': 'spreadsheet',
      // Archive files
      'zip': 'archive',
    };

    // Find matching content type
    return typeMap[extension.toLowerCase()] || 'unknown';
  }

  /**
   * Sort results
   * @param results Result list
   * @param sortBy Sort field
   * @param direction Sort direction
   * @returns Sorted result list
   */
  private sortResults(
    results: FileResult[],
    sortBy: 'name' | 'date' | 'size',
    direction: 'asc' | 'desc' = 'asc',
  ): FileResult[] {
    const sortedResults = [...results];

    sortedResults.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name': {
          comparison = a.name.localeCompare(b.name);
          break;
        }
        case 'date': {
          comparison = a.modifiedTime.getTime() - b.modifiedTime.getTime();
          break;
        }
        case 'size': {
          comparison = a.size - b.size;
          break;
        }
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sortedResults;
  }

  /**
   * Check Spotlight service status
   * @returns Promise indicating if Spotlight is available
   */
  private async checkSpotlightStatus(): Promise<boolean> {
    try {
      // Try to run a simple mdfind command - macOS doesn't support -limit parameter
      await execPromise('mdfind -name test -onlyin ~ -count');
      return true;
    } catch (error) {
      console.error('Spotlight is not available:', error);
      return false;
    }
  }

  /**
   * Update Spotlight index
   * @param path Optional specified path
   * @returns Promise indicating operation success
   */
  private async updateSpotlightIndex(path?: string): Promise<boolean> {
    try {
      // mdutil command is used to manage Spotlight index
      const command = path ? `mdutil -E "${path}"` : 'mdutil -E /';

      await execPromise(command);
      return true;
    } catch (error) {
      console.error('Failed to update Spotlight index:', error);
      return false;
    }
  }
}
