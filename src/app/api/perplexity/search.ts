import type { NextApiRequest, NextApiResponse } from 'next';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/v1/search';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ message: 'Missing query' });
    }

    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            body: JSON.stringify({ query }),
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: String(error), message: 'Perplexity API error' });
    }
}
