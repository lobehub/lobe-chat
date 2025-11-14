import { exec, spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import readline from 'node:readline';
import { promisify } from 'node:util';

import { FileResult, SearchOptions } from '@/types/fileSearch';
import { createLogger } from '@/utils/logger';

import { FileSearchImpl } from '../type';

const execPromise = promisify(exec);
const statPromise = promisify(fs.stat);

// Create logger
const logger = createLogger('module:FileSearch:macOS');

export class MacOSSearchServiceImpl extends FileSearchImpl {
  /**
   * Perform file search
   * @param options Search options
   * @returns Promise of search result list
   */
  async search(options: SearchOptions): Promise<FileResult[]> {
    // Build the command first, regardless of execution method
    const { cmd, args, commandString } = this.buildSearchCommand(options);
    logger.debug(`Executing command: ${commandString}`);

    // Use spawn for both live and non-live updates to handle large outputs
    return new Promise((resolve, reject) => {
      const childProcess = spawn(cmd, args);

      let results: string[] = []; // Store raw file paths
      let stderrData = '';

      // Create a readline interface to process stdout line by line
      const rl = readline.createInterface({
        crlfDelay: Infinity,
        input: childProcess.stdout, // Handle different line endings
      });

      rl.on('line', (line) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          results.push(trimmedLine);

          // If we have a limit and we've reached it (in non-live mode), stop processing
          if (!options.liveUpdate && options.limit && results.length >= options.limit) {
            logger.debug(`Reached limit (${options.limit}), closing readline and killing process.`);
            rl.close(); // Stop reading lines
            childProcess.kill(); // Terminate the mdfind process
          }
        }
      });

      childProcess.stderr.on('data', (data) => {
        const errorMsg = data.toString();
        stderrData += errorMsg;
        logger.warn(`Search stderr: ${errorMsg}`);
      });

      childProcess.on('error', (error) => {
        logger.error(`Search process error: ${error.message}`, error);
        reject(new Error(`Search process failed to start: ${error.message}`));
      });

      childProcess.on('close', async (code) => {
        logger.debug(`Search process exited with code ${code}`);

        // Even if the process was killed due to limit, code might be null or non-zero.
        // Process the results collected so far.
        if (code !== 0 && stderrData && results.length === 0) {
          // If exited with error code and we have stderr message and no results, reject.
          // Filter specific ignorable errors if necessary
          if (!stderrData.includes('Index is unavailable') && !stderrData.includes('kMD')) {
            // Avoid rejecting for common Spotlight query syntax errors or index issues if some results might still be valid
            reject(new Error(`Search process exited with code ${code}: ${stderrData}`));
            return;
          } else {
            logger.warn(
              `Search process exited with code ${code} but contained potentially ignorable errors: ${stderrData}`,
            );
          }
        }

        try {
          // Process the collected file paths
          // Ensure limit is applied again here in case killing the process didn't stop exactly at the limit
          const limitedResults =
            options.limit && results.length > options.limit
              ? results.slice(0, options.limit)
              : results;

          const processedResults = await this.processSearchResultsFromPaths(
            limitedResults,
            options,
          );
          resolve(processedResults);
        } catch (processingError) {
          logger.error('Error processing search results:', processingError);
          reject(new Error(`Failed to process search results: ${processingError.message}`));
        }
      });

      // Handle live update specific logic (if needed in the future, e.g., sending initial batch)
      if (options.liveUpdate) {
        // For live update, we might want to resolve an initial batch
        // or rely purely on events sent elsewhere.
        // Current implementation resolves when the stream closes.
        // We could add a timeout to resolve with initial results if needed.
        logger.debug('Live update enabled, results will be processed on close.');
        // Note: The previous `executeLiveSearch` logic is now integrated here.
        // If specific live update event emission is needed, it would be added here,
        // potentially calling a callback provided in options.
      }
    });
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
   * @returns Command components (cmd, args array, and command string for logging)
   */
  private buildSearchCommand(options: SearchOptions): {
    args: string[];
    cmd: string;
    commandString: string;
  } {
    // Command and arguments array
    const cmd = 'mdfind';
    const args: string[] = [];

    // macOS mdfind doesn't support -limit parameter, we'll limit results in post-processing

    // Search in specific directory
    if (options.onlyIn) {
      args.push('-onlyin', options.onlyIn);
    }

    // Live update
    if (options.liveUpdate) {
      args.push('-live');
    }

    // Detailed metadata
    if (options.detailed) {
      args.push(
        '-attr',
        'kMDItemDisplayName',
        'kMDItemContentType',
        'kMDItemKind',
        'kMDItemFSSize',
        'kMDItemFSCreationDate',
        'kMDItemFSContentChangeDate',
      );
    }

    // Build query expression
    let queryExpression = '';

    // Basic query
    if (options.keywords) {
      // If the query string doesn't use Spotlight query syntax (doesn't contain kMDItem properties),
      // treat it as a flexible name search rather than exact phrase match
      if (!options.keywords.includes('kMDItem')) {
        // Use kMDItemFSName for filename matching with wildcards for better flexibility
        queryExpression = `kMDItemFSName == "*${options.keywords.replaceAll('"', '\\"')}*"cd`;
      } else {
        queryExpression = options.keywords;
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

    // Add query expression to args
    if (queryExpression) {
      args.push(queryExpression);
    }

    // Build command string for logging
    const commandString = `${cmd} ${args.map((arg) => (arg.includes(' ') || arg.includes('*') ? `"${arg}"` : arg)).join(' ')}`;

    return { args, cmd, commandString };
  }

  /**
   * Execute live search, returns initial results and sets callback
   * @param command mdfind command
   * @param options Search options
   * @returns Promise of initial search results
   * @deprecated This logic is now integrated into the main search method using spawn.
   */
  // private executeLiveSearch(command: string, options: SearchOptions): Promise<FileResult[]> { ... }
  // Remove or comment out the old executeLiveSearch method

  /**
   * Process search results from a list of file paths
   * @param filePaths Array of file path strings
   * @param options Search options
   * @returns Formatted file result list
   */
  private async processSearchResultsFromPaths(
    filePaths: string[],
    options: SearchOptions,
  ): Promise<FileResult[]> {
    // Create a result object for each file path
    const resultPromises = filePaths.map(async (filePath) => {
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
        logger.warn(`Error processing file stats for ${filePath}: ${error.message}`, error);
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
   * Process search results
   * @param stdout Command output (now unused directly, processing happens line by line)
   * @param options Search options
   * @returns Formatted file result list
   * @deprecated Use processSearchResultsFromPaths instead.
   */
  // private async processSearchResults(stdout: string, options: SearchOptions): Promise<FileResult[]> { ... }
  // Remove or comment out the old processSearchResults method

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
      logger.warn(`Error getting metadata for ${filePath}: ${error.message}`, error);
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
      logger.error(`Spotlight is not available: ${error.message}`, error);
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
      logger.error(`Failed to update Spotlight index: ${error.message}`, error);
      return false;
    }
  }
}
