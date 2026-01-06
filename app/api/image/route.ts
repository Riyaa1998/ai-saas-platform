import { NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference';

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { getAuthSession } from "@/lib/auth";
import { trackAPIRequest } from "@/lib/realtime-analytics";

// Initialize Hugging Face with API key
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Fallback image URLs when API fails
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1543053975-9e5f95ee96d7?q=80&w=512&h=512&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493119508027-2b584f234d6c?q=80&w=512&h=512&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1683099282548-7b789b476588?q=80&w=512&h=512&auto=format&fit=crop"
];

// Working models for text-to-image on Hugging Face
const MODELS = [
  "prompthero/openjourney",
  "runwayml/stable-diffusion-v1-5",
  "CompVis/stable-diffusion-v1-4"
];

export async function POST(
  req: Request
) {
  const startTime = Date.now();
  let success = false;
  
  try {
    const session = getAuthSession(req as any);
    const userId = session?.userId;
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return new NextResponse("Hugging Face API Key not configured.", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Parse resolution to get width and height
    const [width, height] = resolution.split("x").map(Number);

    try {
      // Choose a reliable model that works with the API
      const model = MODELS[0]; // Start with the first model
      
      // Generate images using Hugging Face
      const responsePromises = [];
      
      // Create multiple images if requested
      const requestAmount = Math.min(amount, 4); // Limit to 4 max
      
      for (let i = 0; i < requestAmount; i++) {
        responsePromises.push(
          Hf.textToImage({
            model: model,
            inputs: prompt,
            parameters: {
              num_inference_steps: 30,
              guidance_scale: 7.5
            }
          })
        );
      }

      const responses = await Promise.all(responsePromises);
      
      // Convert Blob responses to base64 URLs that can be displayed in the frontend
      const imageUrls = await Promise.all(
        responses.map(async (response) => {
          // This blob contains the image data
          const blob = response;
          
          // Convert Blob to base64 data URL
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = blob.type || 'image/jpeg';
          return `data:${mimeType};base64,${base64}`;
        })
      );

      if (!isPro) {
        await incrementApiLimit();
      }

      success = true;
      // Return the generated images
      return NextResponse.json({ 
        images: imageUrls
      });
    } catch (apiError) {
      console.log('[IMAGE_API_ERROR]', apiError);
      
      // Provide fallback images
      const numberOfImages = Math.min(amount, FALLBACK_IMAGES.length);
      const fallbackImages = FALLBACK_IMAGES.slice(0, numberOfImages);
      
      if (!isPro) {
        await incrementApiLimit();
      }
      
      success = true; // Fallback is still a successful response
      return NextResponse.json({ 
        images: fallbackImages,
        fallback: true,
        message: "Using fallback images. The image generation service is currently experiencing issues."
      });
    }
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    // Track API request for real-time analytics
    const duration = Date.now() - startTime;
    trackAPIRequest('image', duration, success);
  }
}
