import { createEmbedding } from "./openai";

export async function generateEmbedding(content: string) {
  const response = await createEmbedding({
    model: "text-embedding-3-small",
    input: content,
  });

  const embedding = response.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }

  return embedding;
}
