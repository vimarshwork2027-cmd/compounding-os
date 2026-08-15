import type { LearningResource } from '../types';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'llama3';

export async function processContentUrl(url: string, model: string = DEFAULT_MODEL): Promise<LearningResource> {
  const prompt = `
You are an expert product and design coach. I am going to give you a URL or topic that a user is planning to consume.
Your job is to act as a "Curriculum Engine". Do not just summarize the content. Instead, extract the core concepts and give the user a real-world application task so they can master these concepts instead of just passively consuming.

URL or Topic: ${url}

Output a strictly valid JSON object matching this schema exactly, with no other text, markdown blocks, or explanation.
{
  "title": "A short, clean title for this resource (e.g., 'The Hook Model')",
  "source": "A guess at the author or platform (e.g., 'YouTube' or 'Nir Eyal')",
  "type": "video" | "book" | "article" | "podcast",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "timeEstimate": "e.g., '20 min' or '3 hours'",
  "whyThis": "One sentence explaining why mastering this matters for a product designer / founder.",
  "applicationTask": "A specific, real-world task the user should do to apply these concepts (e.g., 'Redesign the onboarding flow for your app using the Hook Model').",
  "skills": ["product_strategy", "ux", "retention"],
  "concepts": [
    { "title": "Concept 1 Name (e.g. 'Variable Rewards')" },
    { "title": "Concept 2 Name" }
  ]
}

Ensure the output is ONLY valid JSON.
`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.response);

    // Map to LearningResource
    const resource: LearningResource = {
      id: 'l_' + Date.now().toString(),
      type: parsed.type || 'article',
      title: parsed.title || 'Extracted Resource',
      source: parsed.source || 'Web',
      skills: parsed.skills || ['product_strategy'],
      difficulty: parsed.difficulty || 'Intermediate',
      timeEstimate: parsed.timeEstimate || '30 min',
      whyThis: parsed.whyThis || 'This will help you become a stronger product thinker.',
      applicationTask: parsed.applicationTask || 'Apply these concepts to your next project.',
      concepts: (parsed.concepts || []).map((c: any, i: number) => ({
        id: 'c_' + Date.now().toString() + '_' + i,
        title: c.title,
        mastered: false,
      })),
      progress: 0,
      status: 'queue',
    };

    return resource;
  } catch (error) {
    console.error("Error communicating with Ollama:", error);
    throw new Error("Failed to process content with Ollama. Make sure Ollama is running and OLLAMA_ORIGINS='*' is set.");
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithOllama(messages: ChatMessage[], model: string = DEFAULT_MODEL): Promise<string> {
  const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';
  
  try {
    const response = await fetch(OLLAMA_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  } catch (error) {
    console.error("Error communicating with Ollama chat API:", error);
    throw new Error("Failed to connect to Ollama. Ensure it's running locally with CORS enabled.");
  }
}
