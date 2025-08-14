import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  // Only initialize on server-side
  if (typeof window !== 'undefined') {
    throw new Error("OpenAI client should not be used on client-side");
  }

  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiInstance;
}

export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    const client = getOpenAIClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
