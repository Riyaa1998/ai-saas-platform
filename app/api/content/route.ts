import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";

// AssemblyAI API base URL
const ASSEMBLYAI_API_URL = "https://api.assemblyai.com/lemur/v3/generate";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt, contentType = "blog" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.ASSEMBLYAI_API_KEY) {
      return new NextResponse("AssemblyAI API Key not configured", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Check if user has free trial or is subscribed
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Generate content with AssemblyAI LLM
    let systemPrompt = "You are a professional content creator.";
    let temperature = 0.7;
    
    // Adjust parameters based on content type
    if (contentType === "blog") {
      temperature = 0.7;
      systemPrompt = "You are a professional blog writer. Create engaging, well-researched content that is optimized for SEO.";
    } else if (contentType === "marketing") {
      temperature = 0.8;
      systemPrompt = "You are a marketing expert. Create compelling copy that drives conversions and engages the target audience.";
    } else if (contentType === "social") {
      temperature = 0.9;
      systemPrompt = "You are a social media manager. Create engaging, shareable content optimized for social platforms.";
    }

    // Make a request to AssemblyAI's LeMUR API
    const response = await axios.post(
      ASSEMBLYAI_API_URL,
      {
        prompt: prompt,
        model: "assemblyai/mistral-7b",
        temperature: temperature,
        system_prompt: systemPrompt,
        max_tokens: 1000,
      },
      {
        headers: {
          "Authorization": process.env.ASSEMBLYAI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Increment the API limit if the user is not on a pro plan
    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.log("[CONTENT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 