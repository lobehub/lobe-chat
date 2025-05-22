import { app, dialog } from 'electron'; // Added dialog
import { PGlite } from '@electric-sql/pglite';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { loadFile } from '@lobechat/file-loaders';
import { ServiceModule } from './types'; // Assuming ServiceModule is defined here or in a shared types file

// Configuration
const EMBEDDING_DIMENSION = 384; // Placeholder dimension (e.g., for all-MiniLM-L6-v2)
// const EMBEDDING_DIMENSION = 1536; // Alternative for text-embedding-3-small

// Helper function to simulate embedding generation
// In a real scenario, this would call an actual embedding model (e.g., OpenAI, local model).
// For now, it generates a fixed-size array of random numbers.
// The `embeddingModelApiKey` is included to show where it would be used.
const generatePlaceholderEmbedding = (text: string, embeddingModelApiKey?: string): number[] => {
  console.log(`Generating placeholder embedding for text (first 30 chars): "${text.substring(0, 30)}..." (API key: ${embeddingModelApiKey ? 'provided' : 'not provided'})`);
  // Simple hash-based seed for some determinism if needed for testing, otherwise Math.random() is fine
  let seed = 0;
  for (let i = 0; i < Math.min(text.length, 10); i++) {
    seed = (seed + text.charCodeAt(i) * (i + 1)) % 1000;
  }
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const embedding: number[] = [];
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    embedding.push(random() * 2 - 1); // Generate floats between -1 and 1
  }
  return embedding;
};

// Simple text chunking strategy
const chunkText = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.substring(i, end));
    i += chunkSize - overlap;
    if (i + overlap >= text.length && end === text.length) break; // Prevent infinite loop on last chunk
    if (end === text.length) break;
  }
  return chunks;
};


export class LocalRagSrv extends ServiceModule {
  private db: PGlite | undefined;
  private dbInitialized: Promise<void>;

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    const dbFolderPath = path.join(userDataPath, 'rag_database');
    const dbFilePath = path.join(dbFolderPath, 'vector_store.pglite');

    if (!fs.existsSync(dbFolderPath)) {
      fs.mkdirSync(dbFolderPath, { recursive: true });
    }
    console.log(`[LocalRagSrv] Database path set to: ${dbFilePath}`);
    this.db = new PGlite(dbFilePath);
    // The catch here is for immediate constructor-time errors.
    // _initializeDB itself also has a try-catch.
    this.dbInitialized = this._initializeDB().catch(err => {
        console.error('[LocalRagSrv] Constructor: Database initialization promise rejected.', err);
        // This error will be caught by consumers of `dbInitialized` or `_getDB()`
        throw new Error(`Database initialization failed: ${err.message}`);
    });
  }

  private async _initializeDB(): Promise<void> {
    if (!this.db) {
        // This case should ideally not be reached if constructor logic is sound.
        console.error('[LocalRagSrv_initializeDB] DB instance not available at the start of _initializeDB.');
        throw new Error('DB instance not available for initialization.');
    }
    try {
      console.log('[LocalRagSrv] Initializing database schema and extensions...');
      // PGlite specific: BEGIN/COMMIT for transactional DDL might not be standard
      // but ensures all schema changes are atomic if supported.
      // For PGlite, sequential execution is generally fine.
      await this.db.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('[LocalRagSrv] pgvector extension enabled (or already exists).');

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS text_chunks (
          id TEXT PRIMARY KEY,
          chunk_text TEXT NOT NULL,
          embedding VECTOR(${EMBEDDING_DIMENSION}),
          document_id TEXT NOT NULL,
          chunk_sequence_number INTEGER,
          metadata JSONB
        );
      `);
      console.log('[LocalRagSrv] Table "text_chunks" schema ensured.');

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_hnsw_embedding
        ON text_chunks
        USING hnsw (embedding vector_l2_ops);
      `);
      console.log('[LocalRagSrv] HNSW Index on "embedding" column ensured.');
      console.log('[LocalRagSrv] Database schema initialization complete.');
    } catch (error: any) { // Catch any error
      console.error('[LocalRagSrv_initializeDB] Error during database schema initialization:', error);
      // Propagate a more specific error or the original error
      throw new Error(`Database schema setup failed: ${error.message}`);
    }
  }

  public async ensureDBInitialized(): Promise<void> {
    // This promise will reflect the success or failure of _initializeDB
    return this.dbInitialized;
  }

  private async _getDB(): Promise<PGlite> {
    // Ensure initialization is complete and successful
    try {
      await this.dbInitialized;
    } catch (initError: any) {
      // If dbInitialized promise was rejected, this will throw.
      console.error('[LocalRagSrv_getDB] Database initialization previously failed:', initError.message);
      throw new Error(`Database is not initialized: ${initError.message}`);
    }
    if (!this.db) {
      // This state should ideally not be reached if dbInitialized resolved.
      console.error('[LocalRagSrv_getDB] DB instance is unexpectedly undefined after initialization.');
      throw new Error('Database connection lost or not established after initialization.');
    }
    return this.db;
  }

  async processAndStoreFile(filePath: string, documentId: string, embeddingModelApiKey?: string): Promise<void> {
    console.log(`[LocalRagSrv] Starting to process file: ${filePath} for document ID: ${documentId}`);
    let db;
    try {
      db = await this._getDB();
    } catch (dbError: any) {
      console.error(`[LocalRagSrv_processAndStoreFile] Failed to get DB instance for ${filePath}: ${dbError.message}`);
      throw new Error(`Database access error while processing ${filePath}: ${dbError.message}`);
    }

    let file;
    try {
      file = await loadFile(filePath);
      if (!file || !file.text) {
        console.warn(`[LocalRagSrv_processAndStoreFile] Could not load text content from file: ${filePath}`);
        // Consider throwing a specific error here if this is critical
        throw new Error(`Failed to load content from ${filePath}. File might be empty or unreadable.`);
      }
    } catch (loadError: any) {
      console.error(`[LocalRagSrv_processAndStoreFile] Error loading file ${filePath}:`, loadError);
      throw new Error(`Error reading file ${filePath}: ${loadError.message}`);
    }
    
    console.log(`[LocalRagSrv] File loaded: ${filePath}, content length: ${file.text.length}`);
    const textChunks = chunkText(file.text);
    console.log(`[LocalRagSrv] Text split into ${textChunks.length} chunks for ${filePath}.`);

    try {
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        const chunkId = uuidv4();
        let embedding;
        try {
          embedding = generatePlaceholderEmbedding(chunk, embeddingModelApiKey);
        } catch (embedError: any) {
          console.error(`[LocalRagSrv_processAndStoreFile] Error generating embedding for chunk ${i} of ${filePath}:`, embedError);
          // Decide: skip this chunk, or fail the whole file? For now, fail file.
          throw new Error(`Embedding generation failed for chunk ${i} of ${filePath}: ${embedError.message}`);
        }
        
        const metadata = {
          source_document_id: documentId,
          file_name: path.basename(filePath),
          chunk_char_length: chunk.length,
        };
        const embeddingString = `[${embedding.join(',')}]`;
        
        await db.query(
          `INSERT INTO text_chunks (id, chunk_text, embedding, document_id, chunk_sequence_number, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
              chunk_text = EXCLUDED.chunk_text,
              embedding = EXCLUDED.embedding,
              document_id = EXCLUDED.document_id,
              chunk_sequence_number = EXCLUDED.chunk_sequence_number,
              metadata = EXCLUDED.metadata;`,
          [chunkId, chunk, embeddingString, documentId, i, JSON.stringify(metadata)]
        );
      }
      console.log(`[LocalRagSrv] Successfully processed and stored ${textChunks.length} chunks for document ID: ${documentId} from ${filePath}`);
    } catch (dbQueryError: any) {
      console.error(`[LocalRagSrv_processAndStoreFile] Database error during chunk insertion for ${filePath}:`, dbQueryError);
      throw new Error(`Database error while storing chunks for ${filePath}: ${dbQueryError.message}`);
    }
  }

  async semanticSearch(
    queryText: string,
    k: number,
    embeddingModelApiKey?: string
  ): Promise<Array<{ id: string, text: string; score: number; metadata: any, document_id: string }>> {
    let db;
    try {
      db = await this._getDB();
    } catch (dbError: any) {
      console.error(`[LocalRagSrv_semanticSearch] Failed to get DB instance: ${dbError.message}`);
      throw new Error(`Database access error during semantic search: ${dbError.message}`);
    }
    
    console.log(`[LocalRagSrv] Performing semantic search for query (first 30 chars): "${queryText.substring(0,30)}...", k=${k}`);
    let queryEmbedding;
    try {
      queryEmbedding = generatePlaceholderEmbedding(queryText, embeddingModelApiKey);
    } catch (embedError: any) {
      console.error('[LocalRagSrv_semanticSearch] Error generating query embedding:', embedError);
      throw new Error(`Query embedding generation failed: ${embedError.message}`);
    }
    const queryEmbeddingString = `[${queryEmbedding.join(',')}]`;

    try {
      const { rows } = await db.query(
        `SELECT id, chunk_text, document_id, metadata, embedding <-> $1 AS distance_score
         FROM text_chunks
         ORDER BY embedding <-> $1
         LIMIT $2;`,
        [queryEmbeddingString, k]
      );
      console.log(`[LocalRagSrv] Found ${rows.length} similar records for query.`);
      return rows.map((row: any) => ({
        id: row.id,
        text: row.chunk_text,
        score: row.distance_score,
        metadata: row.metadata,
        document_id: row.document_id,
      }));
    } catch (dbQueryError: any) {
      console.error('[LocalRagSrv_semanticSearch] Database error during search:', dbQueryError);
      throw new Error(`Database search failed: ${dbQueryError.message}`);
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    let db;
    try {
      db = await this._getDB();
    } catch (dbError: any) {
      console.error(`[LocalRagSrv_deleteDocument] Failed to get DB instance for doc ${documentId}: ${dbError.message}`);
      throw new Error(`Database access error while deleting document ${documentId}: ${dbError.message}`);
    }
    
    console.log(`[LocalRagSrv] Attempting to delete all chunks for document ID: ${documentId}`);
    try {
      const result = await db.query(
        'DELETE FROM text_chunks WHERE document_id = $1;',
        [documentId]
      );
      const deletedCount = typeof result.rowCount === 'number' ? result.rowCount : (Array.isArray(result) && result[0]?.rowCount) || 0;
      console.log(`[LocalRagSrv] Deleted ${deletedCount} chunks for document ID: ${documentId}.`);
      if (deletedCount === 0) {
        // This isn't necessarily an error, but could be useful info.
        console.warn(`[LocalRagSrv_deleteDocument] No chunks found for document ID: ${documentId} during deletion.`);
      }
    } catch (dbQueryError: any) {
      console.error(`[LocalRagSrv_deleteDocument] Database error deleting document ${documentId}:`, dbQueryError);
      throw new Error(`Database error while deleting document ${documentId}: ${dbQueryError.message}`);
    }
  }

  // Graceful shutdown
  async destroy(): Promise<void> {
    if (this.db) {
      console.log('[LocalRagSrv] Closing database connection...');
      try {
        await this.db.close();
        console.log('[LocalRagSrv] Database connection closed.');
        this.db = undefined;
      } catch (error) {
        console.error('[LocalRagSrv] Error closing database connection:', error);
      }
    }
  }

  async listIndexedDocuments(): Promise<Array<{ documentId: string; fileName?: string; firstChunkTextHint?: string; totalChunks: number }>> {
    let db;
    try {
      db = await this._getDB();
    } catch (dbError: any) {
      console.error(`[LocalRagSrv_listIndexedDocuments] Failed to get DB instance: ${dbError.message}`);
      throw new Error(`Database access error while listing documents: ${dbError.message}`);
    }
    
    console.log('[LocalRagSrv] Listing indexed documents...');
    try {
      const { rows } = await db.query(`
        SELECT
          document_id,
          (jsonb_array_elements(metadata_agg->0)->>'file_name') as file_name,
          first_chunk_text,
          chunk_count
        FROM (
          SELECT
            document_id,
            jsonb_agg(metadata) FILTER (WHERE metadata IS NOT NULL) as metadata_agg,
            (array_agg(chunk_text ORDER BY chunk_sequence_number ASC))[1] as first_chunk_text,
            COUNT(id) as chunk_count
          FROM text_chunks
          GROUP BY document_id
        ) AS grouped_documents;
      `);
      console.log(`[LocalRagSrv] Found ${rows.length} distinct documents.`);
      return rows.map((row: any) => ({
        documentId: row.document_id,
        fileName: row.file_name || 'N/A',
        firstChunkTextHint: row.first_chunk_text ? row.first_chunk_text.substring(0, 100) + '...' : 'N/A',
        totalChunks: parseInt(row.chunk_count, 10) || 0,
      }));
    } catch (dbQueryError: any) {
      console.error('[LocalRagSrv_listIndexedDocuments] Database error listing documents:', dbQueryError);
      throw new Error(`Database error while listing documents: ${dbQueryError.message}`);
    }
  }

  async selectAndProcessFile(embeddingModelApiKey?: string): Promise<{ success: boolean; message: string; documentId?: string, filePath?: string }> {
    try {
      // ensureDBInitialized is implicitly called by _getDB, but explicit call here for clarity before dialog.
      await this.ensureDBInitialized();
    } catch (initError: any) {
        console.error('[LocalRagSrv_selectAndProcessFile] DB not initialized for file selection:', initError.message);
        return { success: false, message: `Database not ready: ${initError.message}` };
    }

    let dialogResult;
    try {
      dialogResult = await dialog.showOpenDialog({
        properties: ['openFile'],
      });
    } catch (dialogError: any) {
      console.error('[LocalRagSrv_selectAndProcessFile] Error showing open file dialog:', dialogError);
      return { success: false, message: `Failed to open file dialog: ${dialogError.message}` };
    }

    if (dialogResult.canceled || !dialogResult.filePaths || dialogResult.filePaths.length === 0) {
      console.log('[LocalRagSrv] File selection canceled by user.');
      return { success: false, message: 'File selection canceled.' };
    }

    const filePath = dialogResult.filePaths[0];
    const documentId = uuidv4();
    console.log(`[LocalRagSrv] File selected via dialog: ${filePath}, assigned documentId: ${documentId}`);

    try {
      await this.processAndStoreFile(filePath, documentId, embeddingModelApiKey);
      return { 
        success: true, 
        message: `File "${path.basename(filePath)}" processed and added to local knowledge base.`, 
        documentId, 
        filePath 
      };
    } catch (processingError: any) {
      // processAndStoreFile should throw specific errors.
      console.error(`[LocalRagSrv_selectAndProcessFile] Error processing file ${filePath}:`, processingError);
      return { 
        success: false, 
        message: processingError.message || `An unknown error occurred while processing ${filePath}.`, 
        filePath 
      };
    }
  }
}

// Explanation for Placeholder Embedding Generation:
//
// The `generatePlaceholderEmbedding` function serves as a temporary stand-in for
// a real machine learning model that would convert text into numerical vectors
// (embeddings). In a production RAG system, these embeddings are crucial for
// measuring semantic similarity between text chunks and user queries.
//
// Why a placeholder?
// 1. Decoupling: Allows development of the RAG pipeline mechanics (data storage,
//    retrieval) without an immediate dependency on a specific, potentially complex,
//    embedding model setup (which might involve API keys, large model downloads,
//    or GPU dependencies).
// 2. Iteration Speed: Simplifies initial testing and integration of this service.
//    The actual embedding generation can be implemented and refined in a subsequent step.
// 3. Focus: This subtask's primary goal is the service structure and database
//    interaction.
//
// How it works (and its limitations):
// - It creates a fixed-size array (dimension `EMBEDDING_DIMENSION`) of random numbers.
// - The `embeddingModelApiKey` parameter is included to show where an API key for a
//   service like OpenAI would be passed. It's not used by the placeholder.
// - The "random" numbers are generated based on a very simple seed derived from the input text
//   to provide some (very basic) determinism for repeated calls with the same short text,
//   which can be helpful during initial testing. However, for different or longer texts,
//   the embeddings are essentially random.
// - Crucially, these placeholder embeddings lack any semantic meaning. The "similarity"
//   scores from the database using these embeddings will not reflect actual semantic
//   relatedness. This means search results will be random until a proper embedding
//   model is integrated.
//
// Next Steps:
// This placeholder will be replaced with a call to a chosen embedding model.
// This could involve:
// - Integrating with an API like OpenAI's Embeddings API.
// - Using a local sentence-transformer model via a library like `transformers.js`.
// The choice of model will determine the embedding dimension and the quality of
// semantic search.
