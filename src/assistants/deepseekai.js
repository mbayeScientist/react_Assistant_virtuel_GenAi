import OpenAI from "openai";

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
});

export class Assistant {
  #chat;

  constructor(model = "deepseek-chat") {
    this.#chat = { model, history: [] };
  }

  async chat(content) {
    try {
      const completion = await deepseek.chat.completions.create({
        model: this.#chat.model,
        messages: [
          ...this.#chat.history,
          { role: "user", content },
        ],
      });
      
      const response = completion.choices[0].message.content;
      this.#chat.history.push({ role: "user", content });
      this.#chat.history.push({ role: "assistant", content: response });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async *chatStream(content) {
    try {
      const completion = await deepseek.chat.completions.create({
        model: this.#chat.model,
        messages: [
          ...this.#chat.history,
          { role: "user", content },
        ],
        stream: true,
      });

      for await (const chunk of completion) {
        yield chunk.choices[0].delta.content;
      }
    } catch (error) {
      throw error;
    }
  }
}
