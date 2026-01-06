'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Image as ImageIcon, Download } from 'lucide-react';

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.image) {
        setGeneratedImage(`data:image/png;base64,${data.image}`);
      } else {
        throw new Error('No image data received');
      }
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Image Generation</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="font-medium text-blue-800 mb-2">Generate AI Images</h3>
        <p className="text-sm text-blue-700">
          Enter a description of the image you want to generate and click the button below.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Image</CardTitle>
          <CardDescription>
            Describe the image you want to create in as much detail as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A beautiful sunset over mountains, digital art..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                disabled={isGenerating}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="min-w-[150px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>Here's your AI-generated image</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative group">
              <img 
                src={generatedImage} 
                alt="Generated content" 
                className="max-w-full h-auto rounded-lg border shadow-sm"
              />
              <a 
                href={generatedImage}
                download={`ai-image-${Date.now()}.png`}
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-3 rounded-full shadow-md flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
              >
                <Download className="h-4 w-4" />
                Save
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              <span className="font-medium">Prompt:</span> {prompt}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
