// vector-db-setup.js

// -----------------------------------------------------------------------------
// Research Summary & Recommendation
// -----------------------------------------------------------------------------

// **Research Findings:**
// - `pglite`: The official documentation and GitHub repository for `pglite`
//   (https://github.com/electric-sql/pglite) explicitly state that it
//   supports `pgvector`. This makes it a prime candidate as it's a
//   lightweight, WASM-based Postgres that can run in Node.js and
//   supports vector operations.
// - `hnswlib-node`, `faiss-node`: These are bindings to native libraries.
//   While powerful, they can introduce complexities with prebuilt binaries
//   across different Electron-supported platforms (Windows, macOS, Linux)
//   and architectures (x64, arm64). Managing these binaries can be challenging.
// - Pure JavaScript libraries (`vector-db-js`, `lance-js`): These are generally
//   easier to integrate but might not offer the same level of performance or
//   feature set as a Postgres-based solution with `pgvector`, especially for
//   larger datasets or more complex queries. `lance-js` is also WASM-based
//   and could be a good alternative if `pglite` presented issues.

// **Recommendation:**
// `pglite` is the recommended library.
// - **Pros:**
//     - Direct support for `pgvector` for efficient similarity search.
//     - Runs in Node.js, making it suitable for Electron's main process.
//     - Based on Postgres, offering a robust and feature-rich SQL environment.
//     - Persistence to the file system is supported.
//     - Minimal external dependencies beyond the WASM module.
// - **Cons:**
//     - As a WASM-based solution, there might be a slight performance overhead
//       compared to native libraries for very high-throughput tasks, but it's
//       likely sufficient for many Electron app use cases.
//     - `pglite` is single-user/connection, which is generally fine for an
//       embedded database in an Electron app's main process.

// -----------------------------------------------------------------------------
// Installation
// -----------------------------------------------------------------------------

// To install pglite, run:
// npm install @electric-sql/pglite

// -----------------------------------------------------------------------------
// Example Code: pglite with pgvector for Electron Main Process
// -----------------------------------------------------------------------------

// This example would typically be part of a service class or initialized
// during your Electron app's startup sequence in the main process.

// const { app } = require('electron'); // Assuming you're in Electron's main process
const { PGlite } = require('@electric-sql/pglite');
const path = require('path');

// --- Database Initialization ---
// Use app.getPath('userData') for robust path handling in Electron
// For this example, we'll simulate it if `app` is not available (e.g., running in plain Node.js for testing)
const userDataPath = typeof app !== 'undefined' ? app.getPath('userData') : path.join(__dirname, 'electron-app-data');
const dbFilePath = path.join(userDataPath, 'vector_database.pglite');

// Ensure the directory exists (pglite might handle this, but good practice)
const fs = require('fs');
if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

console.log(`Database will be stored at: ${dbFilePath}`);
// Initialize PGlite, persisting to the specified file path
// The `dataDir` option tells PGlite where to store its data.
const db = new PGlite(dbFilePath); // Using the file path directly persists data

async function initializeDatabase() {
    try {
        console.log('Initializing database and enabling pgvector...');
        // PGlite loads extensions via its own mechanism if they are bundled.
        // For pgvector, it's often available by default or loaded automatically.
        // If not, you might need to ensure the extension is available to the WASM build.
        // The PGlite docs state pgvector is supported.

        // Enable pgvector extension (important for vector operations)
        await db.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('pgvector extension enabled.');

        // Define the table schema for storing chunks and embeddings
        await db.query(`
            CREATE TABLE IF NOT EXISTS text_chunks (
                id TEXT PRIMARY KEY,
                chunk_text TEXT NOT NULL,
                embedding VECTOR(384), -- Assuming embedding dimension is 384 (e.g., all-MiniLM-L6-v2)
                document_id TEXT NOT NULL,
                metadata JSONB -- Using JSONB for better performance and flexibility
            );
        `);
        console.log('Table "text_chunks" schema ensured.');

        // Example: Create an index for faster similarity search on the embedding column
        // Using HNSW index for approximate nearest neighbor search (good for large datasets)
        // The choice of M and ef_construction depends on the dataset and desired trade-off
        // between recall and indexing/query speed.
        // Note: Index creation might take time on large existing tables.
        // Check PGlite/pgvector documentation for exact supported index types and syntax.
        // Standard GIN or GIST indexes might also be used for exact KNN with certain operators.
        // For pgvector, HNSW is a common choice.
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_hnsw_embedding
            ON text_chunks
            USING hnsw (embedding vector_l2_ops);
        `);
        // Or, for exact search, a GIST index might be appropriate with cube/vector operators
        // await db.query(`
        //     CREATE INDEX IF NOT EXISTS idx_gist_embedding
        //     ON text_chunks
        //     USING gist (embedding);
        // `);
        console.log('Index on "embedding" column ensured.');

        console.log('Database initialization complete.');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error; // Propagate error for handling upstream
    }
}

// --- Basic Operations Examples ---

/**
 * Adds a new record with text, embedding, and metadata.
 * @param {string} id - Unique ID for the chunk.
 * @param {string} chunkText - The text content of the chunk.
 * @param {number[]} embedding - The vector embedding of the chunk.
 * @param {string} documentId - ID of the source document.
 * @param {object} metadata - Additional metadata.
 */
async function addRecord(id, chunkText, embedding, documentId, metadata) {
    try {
        // Ensure embedding is in the correct string format for pgvector: '[1,2,3,...]'
        const embeddingString = `[${embedding.join(',')}]`;
        const result = await db.query(
            `INSERT INTO text_chunks (id, chunk_text, embedding, document_id, metadata)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET
                chunk_text = EXCLUDED.chunk_text,
                embedding = EXCLUDED.embedding,
                document_id = EXCLUDED.document_id,
                metadata = EXCLUDED.metadata;`,
            [id, chunkText, embeddingString, documentId, JSON.stringify(metadata)]
        );
        console.log(`Record added/updated with ID: ${id}`, result);
        return result;
    } catch (error) {
        console.error(`Error adding record ID ${id}:`, error);
        throw error;
    }
}

/**
 * Performs a k-NN similarity search.
 * @param {number[]} queryEmbedding - The embedding to search against.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Promise<object[]>} - Array of matching records.
 */
async function findSimilarRecords(queryEmbedding, k) {
    try {
        const queryEmbeddingString = `[${queryEmbedding.join(',')}]`;
        // Using L2 distance (<->) for similarity. Other operators:
        // '<#>' for inner product
        // '<=>' for cosine distance (often 1 - cosine_similarity)
        const { rows } = await db.query(
            `SELECT id, chunk_text, document_id, metadata, embedding <-> $1 AS distance
             FROM text_chunks
             ORDER BY embedding <-> $1
             LIMIT $2;`,
            [queryEmbeddingString, k]
        );
        console.log(`Found ${rows.length} similar records.`);
        return rows;
    } catch (error) {
        console.error('Error finding similar records:', error);
        throw error;
    }
}

/**
 * Deletes records associated with a specific document_id.
 * @param {string} documentId - The ID of the document whose records should be deleted.
 */
async function deleteRecordsByDocumentId(documentId) {
    try {
        const result = await db.query(
            'DELETE FROM text_chunks WHERE document_id = $1;',
            [documentId]
        );
        console.log(`Deleted ${result.rowCount || 0} records for document ID: ${documentId}`);
        return result;
    } catch (error) {
        console.error(`Error deleting records for document ID ${documentId}:`, error);
        throw error;
    }
}

// --- Example Usage ---
async function runExamples() {
    await initializeDatabase();

    // Example data
    const exampleEmbedding1 = Array(384).fill(0).map((_, i) => i * 0.001); // Dummy embedding
    const exampleEmbedding2 = Array(384).fill(0).map((_, i) => i * 0.002); // Another dummy embedding
    const queryEmbedding = Array(384).fill(0).map((_, i) => i * 0.0015);   // Dummy query

    console.log('\n--- Adding Records ---');
    await addRecord('chunk1_doc1', 'This is the first text chunk from document 1.', exampleEmbedding1, 'doc1', { source: 'report.pdf', page: 1 });
    await addRecord('chunk2_doc1', 'Another chunk from document 1, discussing different topics.', exampleEmbedding2, 'doc1', { source: 'report.pdf', page: 2 });
    await addRecord('chunk1_doc2', 'Text from a completely different document, document 2.', Array(384).fill(0.5), 'doc2', { source: 'notes.txt' });

    console.log('\n--- Finding Similar Records (k=2) ---');
    const similar = await findSimilarRecords(queryEmbedding, 2);
    similar.forEach(record => {
        console.log(`  ID: ${record.id}, DocID: ${record.document_id}, Distance: ${record.distance}, Text: "${record.chunk_text.substring(0, 30)}..."`);
    });

    console.log('\n--- Deleting Records for doc1 ---');
    await deleteRecordsByDocumentId('doc1');
    const recordsAfterDelete = await db.query('SELECT COUNT(*) as count FROM text_chunks WHERE document_id = $1', ['doc1']);
    console.log('Records remaining for doc1:', recordsAfterDelete.rows[0].count);


    console.log('\n--- Finding Similar Records Again (k=2) ---');
    const similarAgain = await findSimilarRecords(queryEmbedding, 2);
     similarAgain.forEach(record => {
        console.log(`  ID: ${record.id}, DocID: ${record.document_id}, Distance: ${record.distance}, Text: "${record.chunk_text.substring(0, 30)}..."`);
    });


    console.log('\n--- Closing database connection ---');
    // PGlite specific: close the database to free resources and ensure data is flushed.
    // This is important especially before the application exits.
    await db.close();
    console.log('Database connection closed.');
}

// Run the examples if this script is executed directly (for testing)
if (require.main === module) {
    runExamples().catch(err => {
        console.error("An error occurred during example execution:", err);
        process.exit(1);
    });
}

module.exports = {
    initializeDatabase,
    addRecord,
    findSimilarRecords,
    deleteRecordsByDocumentId,
    // Export `db` instance if needed directly by other modules, though encapsulating is better.
    // dbInstance: db
};
