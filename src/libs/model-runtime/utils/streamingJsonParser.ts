/**
 * Utility for parsing streaming JSON data that may be split across chunks
 */
export class StreamingJsonParser {
  private buffer = '';

  /**
   * Process a chunk of data and extract complete JSON objects
   * @param chunk - The data chunk to process
   * @returns Array of parsed JSON objects
   */
  processChunk(chunk: string): any[] {
    this.buffer += chunk;
    const results: any[] = [];

    let jsonStart = this.buffer.indexOf('{');
    while (jsonStart !== -1) {
      let braceCount = 0;
      let jsonEnd = jsonStart;

      // Find the end of the JSON object by counting braces
      for (let i = jsonStart; i < this.buffer.length; i++) {
        if (this.buffer[i] === '{') braceCount++;
        if (this.buffer[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }

      // If we have a complete JSON object
      if (braceCount === 0) {
        const jsonStr = this.buffer.slice(jsonStart, jsonEnd);

        try {
          const data = JSON.parse(jsonStr);
          results.push(data);
        } catch {
          // Skip malformed JSON
        }

        this.buffer = this.buffer.slice(jsonEnd);
        jsonStart = this.buffer.indexOf('{');
      } else {
        // Incomplete JSON, wait for more data
        break;
      }
    }

    return results;
  }

  /**
   * Reset the internal buffer
   */
  reset(): void {
    this.buffer = '';
  }
}
