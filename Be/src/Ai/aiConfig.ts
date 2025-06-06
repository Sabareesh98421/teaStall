// aiConfig.ts
import OpenAI from "openai";
const chatGptAPI = Bun.env.OPEN_AI_API_KEY;
const Ai = new OpenAI({
    apiKey: chatGptAPI
});
export default Ai;