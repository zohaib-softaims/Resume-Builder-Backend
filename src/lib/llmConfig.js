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

    console.log("Prompt tokens:", response.usage.prompt_tokens);
    console.log("Completion tokens:", response.usage.completion_tokens);
    console.log("Total tokens:", response.usage.total_tokens);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("LLM Error:", error);
    return "Sorry, something went wrong with the assistant.";
  }
}
