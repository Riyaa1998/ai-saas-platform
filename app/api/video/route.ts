import { NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference';

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { getAuthSession } from "@/lib/auth";

// Initialize Hugging Face with API key
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Fallback image/gif URLs when API fails
const FALLBACK_VIDEOS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWs1YjBpdWl3ZTVzcGJoZWQ3NTFmMXJ5MG02aWMwc3F2ZHR1ZmVxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu8sRnYpTOG1p8k/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYW9jYWFqb202djVleThxZzN3eW5tdW9veGFlYzAyMWdtbWNyaGRzbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2wh2oUz1tI4nPpFQo6/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjVrc2E5cmVnanJwbXd1NWZjaXF2eWdtaWh1Z21wM2RucjdwZm9haiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vRaLHmbnBINlOF2/giphy.gif"
];

// Working models for text-to-image on Hugging Face
const SUPPORTED_MODELS = [
  "prompthero/openjourney",
  "runwayml/stable-diffusion-v1-5",
  "CompVis/stable-diffusion-v1-4"
];

export async function POST(
  req: Request
) {
  try {
    const session = getAuthSession(req as any);
    const userId = session?.userId;
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return new NextResponse("Hugging Face API Key not configured.", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    try {
      // Select a random model from the supported models list
      const selectedModelIndex = Math.floor(Math.random() * SUPPORTED_MODELS.length);
      const selectedModel = SUPPORTED_MODELS[selectedModelIndex];
      
      console.log(`[VIDEO_API] Using model: ${selectedModel} for prompt: ${prompt}`);
      
      // Use Hugging Face text-to-image with the selected supported model
      const response = await Hf.textToImage({
        model: selectedModel,
        inputs: `${prompt} animated, dynamic scene with motion blur, cinematic, 4k, detailed`,
      });
      
      // Convert Blob response to base64 URL that can be displayed in the frontend
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = response.type || 'image/jpeg';
      const videoUrl = `data:${mimeType};base64,${base64}`;

      if (!isPro) {
        await incrementApiLimit();
      }

      return NextResponse.json({ 
        video: videoUrl
      });
    } catch (apiError) {
      console.error('[VIDEO_API_ERROR]', apiError);
      
      // Use fallback video
      const randomIndex = Math.floor(Math.random() * FALLBACK_VIDEOS.length);
      const fallbackVideo = FALLBACK_VIDEOS[randomIndex];
      
      if (!isPro) {
        await incrementApiLimit();
      }
      
      return NextResponse.json({ 
        video: fallbackVideo,
        fallback: true,
        message: "Using fallback video. The video generation service is currently experiencing issues."
      });
    }
  } catch (error) {
    console.log('[VIDEO_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
