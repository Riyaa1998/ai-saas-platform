import { NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference';
import { checkSubscription } from "@/lib/subscription";
import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { getAuthSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import os from "os";

// Initialize Hugging Face with API key
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Fallback messages in case of transcription failure
const FALLBACK_MESSAGES = [
  "Sorry, I couldn't transcribe that audio properly. Please try again.",
  "The audio couldn't be processed. Please ensure it's clear and try again.",
  "I had trouble understanding that. Could you please try speaking more clearly?"
];

// Get a random fallback message
const getRandomFallbackMessage = () => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_MESSAGES.length);
  return FALLBACK_MESSAGES[randomIndex];
};

export async function POST(
  req: Request
) {
  // This will track if we've created a temporary file that needs cleanup
  let tempPath: string | null = null;
  
  try {
    const session = getAuthSession(req as any);
    const userId = session?.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return new NextResponse("Hugging Face API Key not configured.", { status: 500 });
    }

    const formData = await req.formData();
    const audio = formData.get("audio") as File;

    if (!audio) {
      return new NextResponse("Audio file is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    try {
      // Convert the audio file to a Blob for Hugging Face
      const audioBytes = await audio.arrayBuffer();
      const audioBlob = new Blob([audioBytes], { type: audio.type });
      
      // Use Hugging Face for speech-to-text with improved model selection
      // Using whisper-large-v3 for better accuracy
      const transcription = await Hf.automaticSpeechRecognition({
        model: "openai/whisper-large-v3",
        data: audioBlob
      });
      
      if (!isPro) {
        await incrementApiLimit();
      }

      // If we got empty text, provide a helpful message
      if (!transcription.text || transcription.text.trim() === "") {
        return NextResponse.json({ 
          text: "No speech detected. Please try again with clearer audio.",
          success: false
        });
      }

      return NextResponse.json({ 
        text: transcription.text,
        success: true
      });
    } catch (transcriptionError) {
      console.error("[TRANSCRIPTION_ERROR]", transcriptionError);
      
      return NextResponse.json({ 
        text: getRandomFallbackMessage(),
        success: false,
        error: "Failed to transcribe audio"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[SPEECH_TO_TEXT_ERROR]", error);
    
    return NextResponse.json({ 
      text: getRandomFallbackMessage(),
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 
} 