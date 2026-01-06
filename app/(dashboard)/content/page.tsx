"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Heading } from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-fixed";
import { useForm } from "react-hook-form";
import { Loader } from "@/components/loader";

const ContentPage = () => {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm({
    defaultValues: {
      prompt: "",
      contentType: "blog",
    },
  });

  const onSubmit = async (values: { prompt: string, contentType: string }) => {
    try {
      setContent("");
      setIsGenerating(true);

      const response = await axios.post("/api/content", values);
      
      setContent(response.data.output);
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("You have reached your free tier limit. Please upgrade to continue.");
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setIsGenerating(false);
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="AI Content Creator"
        description="Our most advanced content generation model."
        icon={Sparkles}
        iconColor="text-purple-500"
        bgColor="bg-purple-500/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="contentType"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isGenerating}
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
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-8">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isGenerating}
                      placeholder="Create a blog post about the benefits of AI in healthcare..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              type="submit"
              disabled={isGenerating}
              size="icon"
            >
              Generate
            </Button>
          </form>
        </Form>
        {isGenerating && (
          <div className="p-8 rounded-lg w-full flex items-center justify-center">
            <Loader />
          </div>
        )}
        {content && !isGenerating && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="text-sm whitespace-pre-wrap">
                {content}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentPage; 