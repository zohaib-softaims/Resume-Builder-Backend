import OpenAI from "openai";
import { configDotenv } from "dotenv";
configDotenv();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getLLMResponse({ systemPrompt, messages, model = "gpt-4o" }) {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    console.log("Prompt tokens:", response.usage.prompt_tokens);
    console.log("Completion tokens:", response.usage.completion_tokens);
    console.log("Total tokens:", response.usage.total_tokens);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("LLM Error:", error);
    return "Sorry, something went wrong with the assistant.";
  }
}
