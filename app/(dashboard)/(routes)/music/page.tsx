"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Music, Send, Info } from "lucide-react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { formSchema, MODELS, STYLES } from "./constants";

const MusicPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [music, setMusic] = useState<string>();
  const [isFallback, setIsFallback] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [generatedInfo, setGeneratedInfo] = useState<{
    model?: string;
    style?: string;
  }>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      model: "v3",
      style: "cinematic"
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic(undefined);
      setIsFallback(false);
      setIsDemo(false);
      setGeneratedInfo({});

      const response = await axios.post('/api/music', values);
      
      setMusic(response.data.audio);
      
      if (response.data.model && response.data.style) {
        setGeneratedInfo({
          model: response.data.model,
          style: response.data.style
        });
      }
      
      // Check if using demo mode (no API key)
      if (response.data.demo) {
        setIsDemo(true);
        toast.success("Using demo mode with sample audio files");
      }
      // Check if we're using a fallback audio due to error
      else if (response.data.fallback) {
        setIsFallback(true);
        toast.error("Music generation failed. Using a sample track instead.");
      } else {
        toast.success("Music generated successfully!");
      }
      
      form.reset({ 
        ...values,
        prompt: ""
      });
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  }

  return ( 
    <div>
      <Heading
        title="Music Generation"
        description="Turn your prompt into music with Suno AI."
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="
              rounded-lg 
              border 
              w-full 
              p-4 
              px-3 
              md:px-6 
              focus-within:shadow-sm
              grid
              grid-cols-12
              gap-2
            "
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading} 
                      placeholder="Piano solo with emotional melody" 
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading}>
              Generate
            </Button>
            <div className="col-span-12 grid grid-cols-2 gap-2 mt-2">
              <FormField
                name="model"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <div className="flex items-center">
                      <FormLabel>Model</FormLabel>
                      <span className="ml-2 text-xs text-muted-foreground">(higher quality models generate better music)</span>
                    </div>
                    <Select 
                      disabled={isLoading} 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODELS.map((model) => (
                          <SelectItem 
                            key={model.value} 
                            value={model.value}
                          >
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                name="style"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <div className="flex items-center">
                      <FormLabel>Style</FormLabel>
                      <span className="ml-2 text-xs text-muted-foreground">(musical style to apply)</span>
                    </div>
                    <Select 
                      disabled={isLoading} 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STYLES.map((style) => (
                          <SelectItem 
                            key={style.value} 
                            value={style.value}
                          >
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {!music && !isLoading && (
          <Empty label="No music generated." />
        )}
        {music && (
          <Card className="mt-8">
            <CardContent className="p-6">
              {isDemo && (
                <div className="mb-4 text-sm text-blue-700 bg-blue-50 p-3 rounded-md">
                  <p><b>Demo Mode:</b> Using sample audio files since no Suno API key is configured. The audio style changes based on your selection.</p>
                </div>
              )}
              {isFallback && (
                <div className="mb-4 text-sm text-amber-500 bg-amber-50 p-3 rounded-md">
                  Note: This is a sample track as we couldn&apos;t generate your custom music. Please try again with a different prompt.
                </div>
              )}
              {!isFallback && !isDemo && generatedInfo.model && generatedInfo.style && (
                <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-md">
                  Generated using {MODELS.find(m => m.value === generatedInfo.model)?.label || generatedInfo.model} 
                  with {STYLES.find(s => s.value === generatedInfo.style)?.label || generatedInfo.style} style
                </div>
              )}
              <audio controls className="w-full">
                <source src={music} />
              </audio>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
   );
}
 
export default MusicPage;
