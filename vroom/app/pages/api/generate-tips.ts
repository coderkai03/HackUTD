import type { NextApiRequest, NextApiResponse } from 'next';
import openai from 'openai';

const client = new openai.OpenAI({
  apiKey: process.env.SAMBANOVA_API_KEY,
  baseURL: 'https://api.sambanova.ai/v1',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { weather, time } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: 'Meta-Llama-3.1-8B-Instruct',
      messages: [
        // { role: 'system', content: 'Provide concise driving tips based on conditions.' },
        { role: 'user', content: `say hello` },
      ],
      
      temperature: 0.1,
      top_p: 0.1,
      max_tokens: 800
    });

    const instructions = response.choices[0]?.message?.content;
    res.status(200).json({ instructions });
  } catch (error) {
    console.error('Error generating driving instructions:', error);
    res.status(500).json({ error: 'Failed to generate directions' });
  }
}
