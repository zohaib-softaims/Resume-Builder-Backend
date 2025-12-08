import { pinecone } from "./pineconeClient.js";
import { v4 as uuidv4 } from "uuid";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  dimensions: 1536,
});

export const storeResume = async (resumeId, sanitizedText, resumeAnalysis, platform = "Custom AI Resume Builder") => {
  try {
    if (!sanitizedText || sanitizedText.trim().length === 0) {
      console.log("No resume text available to store in pinecone");
      return;
    }

    const vector = await embeddings.embedQuery(sanitizedText);
    const index = pinecone.Index("resumes");

    await index.upsert([
      {
        id: uuidv4(),
        values: vector,
        metadata: {
          resumeId,
          platform,
          timestamp: Date.now(),
          resumeAnalysis,
          resumeText: sanitizedText,
        },
      },
    ]);
    console.log("Resume stored in pinecone");
  } catch (error) {
    console.log("error storing resume text in pinecone", error);
  }
};

export const getRelevantResume = async (resumeText) => {
  try {
    if (!resumeText || resumeText.trim().length === 0) {
      return null;
    }

    const queryVector = await embeddings.embedQuery(resumeText);
    const index = pinecone.Index("resumes");

    const result = await index.query({
      vector: queryVector,
      topK: 1,
      includeMetadata: true,
    });

    if (result.matches && result.matches.length > 0) {
      const matchedResume = result.matches[0];
      console.log("matched resume", matchedResume);

      return {
        score: matchedResume.score,
        resumeAnalysis: matchedResume.metadata?.resumeAnalysis || null,
        resumeId: matchedResume.metadata?.resumeId || null,
        resumeText: matchedResume.metadata?.resumeText || null,
      };
    }

    return null;
  } catch (error) {
    console.log("Error fetching resume from pinecone", error);
    return null;
  }
};
