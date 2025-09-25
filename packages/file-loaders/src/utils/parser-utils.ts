import { DOMParser as XmlDomParser } from '@xmldom/xmldom';
import concat from 'concat-stream';
import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';
import yauzl from 'yauzl';

// Define basic error messages
const ERRORMSG = {
  fileCorrupted: (filepath: string | Buffer) =>
    `[OfficeParser]: Your file ${typeof filepath === 'string' ? filepath : 'Buffer'} seems to be corrupted. If you are sure it is fine, please create a ticket.`,
  invalidInput: `[OfficeParser]: Invalid input type: Expected a Buffer or a valid file path`,
};

/** Returns parsed xml document for a given xml text.
 * @param {string} xml The xml string from the doc file
 * @returns {XMLDocument}
 */
export const parseString = (xml: string) => {
  // Use xmldom's DOMParser for consistent behavior across environments
  const parser = new XmlDomParser();
  return parser.parseFromString(xml, 'text/xml') as unknown as XMLDocument;
};

export interface ExtractedFile {
  content: string;
  path: string;
}

/** Extract specific files from either a ZIP file buffer or file path based on a filter function.
 * @param {Buffer|string}          zipInput ZIP file input, either a Buffer or a file path (string).
 * @param {(fileName: string) => boolean} filterFn A function that receives the entry file name and returns true if the file should be extracted.
 * @returns {Promise<ExtractedFile[]>} Resolves to an array of object containing file path and content.
 */
export function extractFiles(
  zipInput: Buffer | string,
  filterFn: (fileName: string) => boolean,
): Promise<ExtractedFile[]> {
  return new Promise((resolve, reject) => {
    /** Processes zip file and resolves with the path of file and their content.
     * @param {yauzl.ZipFile} zipfile
     */
    const processZipfile = (zipfile: yauzl.ZipFile) => {
      const extractedFiles: ExtractedFile[] = [];
      zipfile.readEntry(); // Start reading entries

      zipfile.on('entry', (entry: yauzl.Entry) => {
        // Directory entries end with a forward slash
        if (entry.fileName.endsWith('/')) {
          zipfile.readEntry(); // Skip directories
          return;
        }

        // Use the filter function to determine if the file should be extracted
        if (filterFn(entry.fileName)) {
          zipfile.openReadStream(entry, (err: Error | null, readStream?: Readable) => {
            if (err) {
              zipfile.close(); // Ensure zipfile is closed on error
              return reject(err);
            }
            if (!readStream) {
              zipfile.close();
              return reject(new Error(`Could not open read stream for ${entry.fileName}`));
            }

            // Use concat-stream to collect the data into a single Buffer
            readStream.pipe(
              concat((data: Buffer) => {
                extractedFiles.push({
                  content: data.toString('utf8'),
                  path: entry.fileName, // Specify encoding
                });
                zipfile.readEntry(); // Continue reading entries
              }),
            );
            readStream.on('error', (streamErr: Error) => {
              zipfile.close();
              reject(streamErr);
            });
          });
        } else {
          zipfile.readEntry(); // Skip entries that don't match the filter
        }
      });

      zipfile.on('end', () => {
        resolve(extractedFiles);
        zipfile.close(); // Close the zipfile when done reading entries
      });

      zipfile.on('error', (err: Error) => {
        zipfile.close();
        reject(err);
      });
    };

    // Determine whether the input is a buffer or file path
    if (Buffer.isBuffer(zipInput)) {
      // Process ZIP from Buffer
      yauzl.fromBuffer(zipInput, { lazyEntries: true }, (err: Error | null, zipfile?: yauzl.ZipFile) => {
        if (err || !zipfile) return reject(err || new Error('Failed to open zip from buffer'));
        processZipfile(zipfile);
      });
    } else if (typeof zipInput === 'string') {
      // Process ZIP from File Path
      yauzl.open(zipInput, { lazyEntries: true }, (err: Error | null, zipfile?: yauzl.ZipFile) => {
        if (err || !zipfile)
          return reject(err || new Error(`Failed to open zip file: ${zipInput}`));
        processZipfile(zipfile);
      });
    } else {
      reject(new Error(ERRORMSG.invalidInput));
    }
  });
}
