import OpenAI from "openai";
import { configDotenv } from "dotenv";
configDotenv();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getLLMResponse({ systemPrompt, messages, model = "gpt-4o-2024-08-06", responseSchema, schemaName }) {
  try {
    const requestConfig = {
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    };

    // Only add response_format if schema is provided
    if (responseSchema && schemaName) {
      requestConfig.response_format = {
        type: "json_schema",
        json_schema: {
          name: schemaName,
          strict: true,
          schema: responseSchema,
        },
      };
    }

    const response = await openai.chat.completions.create(requestConfig);

    return response.choices[0].message.content;
  } catch (error) {
    console.error("LLM Error:", error);
    throw error;
  }
}
