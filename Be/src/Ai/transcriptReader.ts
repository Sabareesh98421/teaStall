// transcriptReader.ts
import { t } from "elysia";
import Ai from "./aiConfig";
import type { ChatCompletion } from "openai/resources/index";
class TranscriptReader {
    // only can create 2 instance of this class,fear of cost 
    private static instanceCount = 0;
    private static readonly MAX_INSTANCES = 2;
    constructor() {
        this.checkInstanceLimit();

    }
    private checkInstanceLimit(): void {
        if (TranscriptReader.instanceCount >= TranscriptReader.MAX_INSTANCES) {
            throw new Error("Maximum instance limit reached for TranscriptReader.");
        }
        TranscriptReader.instanceCount++;
    }

    private async parseTranscript(transcript: string) {
        const prompt = `Extract the user's order details from the following transcript:\n\n${transcript}\n\nPlease provide the order details in JSON format.`;
        const maxRetries = 3;
        let attempt = 0;
        let response: ChatCompletion | null = null;
        while (attempt < maxRetries) {
            try {

                response = await Ai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1500,
                    temperature: 0,
                })
                attempt++;
                return response.choices[0].message.content;
            }
            catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxRetries) {
                    throw new Error(`Failed to parse transcript after ${maxRetries} attempts.`);
                }
                // optionally add delay here before retrying
                await new Promise(res => setTimeout(res, 500 * attempt));
            }
        }

    }
}
