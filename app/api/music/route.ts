import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

// Fallback audio mapping
const FALLBACK_AUDIO = {
  "cinematic": "https://replicate.delivery/pbxt/QkGkOLTwGFYgYQhsmcQAGRYyHAlrlata7kt9qChHKZlMCDFE/audio_out.wav",
  "acoustic": "https://replicate.delivery/pbxt/U3WkhxR8MBptMVaXVll5Vo2oj3qp8LHaLF4bg4CGuZxnPeKEC/audio_out.wav",
  "electronic": "https://replicate.delivery/pbxt/QT0QkwTfIjklWZZ5mTRXV5FQOBT9c41Oig8mB3jUlt0U3prQA/audio_out.wav",
  "ambient": "https://replicate.delivery/pbxt/U3J0iIHaZJdrhFkXjVnlFXMmkXpx75sgJ8zNNj1rf12aPeKEC/audio_out.wav",
  "lofi": "https://replicate.delivery/pbxt/U08ijCYMtlKk9y1jQPnkXHxRbtK5GCo2BzN1NVr6K5VZ5prQA/audio_out.wav"
};

// Initialize Hugging Face
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Music model configurations
const MUSIC_MODELS = {
  "audioldm": "cvssp/audioldm",
  "audioldm2": "cvssp/audioldm2",
  "musicgen": "facebook/musicgen-small"
};

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, model, style } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!model) {
      return new NextResponse("Model is required", { status: 400 });
    }

    if (!style) {
      return new NextResponse("Style is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Enhance prompt based on style
    let enhancedPrompt = prompt;
    if (style === "cinematic") {
      enhancedPrompt = `${prompt} - Orchestral, epic, movie soundtrack with strings and brass`;
    } else if (style === "acoustic") {
      enhancedPrompt = `${prompt} - Acoustic guitar, soft, melodic, folk-inspired`;
    } else if (style === "electronic") {
      enhancedPrompt = `${prompt} - Electronic beats, synthesizers, modern production`;
    } else if (style === "ambient") {
      enhancedPrompt = `${prompt} - Atmospheric, relaxing, peaceful ambient music`;
    } else if (style === "lofi") {
      enhancedPrompt = `${prompt} - Lo-fi hip hop beats, relaxed, chill`;
    }

    console.log("Using Hugging Face for music generation");
    console.log("Model:", MUSIC_MODELS[model as keyof typeof MUSIC_MODELS]);
    console.log("Prompt:", enhancedPrompt);

    if (!process.env.HUGGINGFACE_API_KEY) {
      console.log("No API key found, using fallback audio");
      return new NextResponse(JSON.stringify({
        music: FALLBACK_AUDIO[style as keyof typeof FALLBACK_AUDIO] || FALLBACK_AUDIO["cinematic"],
        fallback: true
      }));
    }

    let audioBlob;
    try {
      // Using the correct method for text-to-audio generation
      // The HfInference class provides methods for different AI tasks
      // For audio generation we need to use textToSpeech method
      const modelId = MUSIC_MODELS[model as keyof typeof MUSIC_MODELS];
      
      // The Hugging Face text-to-speech method
      audioBlob = await hf.textToSpeech({
        model: modelId,
        inputs: enhancedPrompt,
      });
      
    } catch (error) {
      console.error("Hugging Face API error:", error);
      return new NextResponse(JSON.stringify({
        music: FALLBACK_AUDIO[style as keyof typeof FALLBACK_AUDIO] || FALLBACK_AUDIO["cinematic"],
        fallback: true,
        error: "Failed to generate with Hugging Face"
      }));
    }

    if (!audioBlob) {
      console.error("Failed to generate audio, using fallback");
      return new NextResponse(JSON.stringify({
        music: FALLBACK_AUDIO[style as keyof typeof FALLBACK_AUDIO] || FALLBACK_AUDIO["cinematic"],
        fallback: true
      }));
    }

    // Convert blob to base64
    const buffer = await audioBlob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64}`;

    if (!isPro) {
      await incrementApiLimit();
    }

    return new NextResponse(JSON.stringify({
      music: audioUrl,
      fallback: false
    }));
  } catch (error) {
    console.log('[MUSIC_ERROR]', error);
    return new NextResponse(JSON.stringify({
      music: FALLBACK_AUDIO["cinematic"],
      fallback: true,
      error: "Failed to generate music"
    }), { status: 500 });
  }
}
