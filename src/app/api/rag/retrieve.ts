import express from 'express';

const router = express.Router();

// Minimal RAG workflow (RAG-SaaS pattern)
router.post('/query', async (req, res) => {
    const { query, documents } = req.body;
    // Simulate retrieval-augmented generation
    const retrievedDocs = documents?.slice(0, 2) || [];
    const context = retrievedDocs.map((doc: any) => doc.content).join(' ');
    const response = `LLM response to '${query}' with context: ${context}`;
    res.json({ context, response });
});

// Admin config endpoint
router.get('/config', (req, res) => {
    res.json({ embeddingModel: 'text-embedding-3-small', systemPrompt: 'You are a helpful assistant.', vectorDb: 'qdrant' });
});

export default router;
