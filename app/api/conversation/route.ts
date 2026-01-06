import { NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face with API key
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Simple model configuration
const MODEL_CONFIG = {
  model: "gpt2", // Using a more reliable model
  parameters: {
    max_new_tokens: 100,
    temperature: 0.7,
    top_p: 0.9,
    return_full_text: false
  }
};

// Simple fallback responses
const FALLBACK_RESPONSES = [
  "I'm here to help! What would you like to know?",
  "Thanks for your message! How can I assist you today?",
  "I'm ready to help. What's on your mind?"
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Invalid messages format", { status: 400 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || "";

    try {
      // Simple response generation
      const response = await Hf.textGeneration({
        model: MODEL_CONFIG.model,
        inputs: `User: ${userMessage}\nAssistant:`,
        parameters: MODEL_CONFIG.parameters
      });

      const generatedText = response.generated_text?.trim() || '';
      
      // Simple cleanup of the response
      let cleanedResponse = generatedText
        .replace(/^[\s\n]+/, '')
        .replace(/[\s\n]+$/, '');

      if (!cleanedResponse) {
        throw new Error('Empty response from model');
      }

      return NextResponse.json({
        role: "assistant",
        content: cleanedResponse
      });
      
    } catch (error) {
      console.error("Error generating response:", error);
      
      // Return a fallback response
      return NextResponse.json({
        role: "assistant",
        content: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
      });
    }
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Simple function to format messages
function formatMessagesForHuggingFace(messages: any[]): string {
  // Just get the last user message for simplicity
  const lastMessage = messages[messages.length - 1];
  return `User: ${lastMessage?.content || ''}\nAssistant:`;
}
