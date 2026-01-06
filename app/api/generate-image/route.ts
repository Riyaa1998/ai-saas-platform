import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(HF_API_KEY);

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate image using Stable Diffusion
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry, low quality',
        num_inference_steps: 30,
      },
    });

    // Convert the response to base64
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return NextResponse.json({ 
      success: true,
      image: base64,
      message: 'Image generated successfully!'
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate image. Please try again later.' 
      },
      { status: 500 }
    );
  }
}
