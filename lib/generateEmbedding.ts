import { openai } from "./openai";

export async function generateEmbedding(content: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });

  return response.data[0].embedding;
}