"use client";

import * as z from "zod";
import axios from "axios";
import { MessageSquare, Send, Bot, User, Sparkles, Zap, Brain, Mic, MicOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";

import { formSchema } from "./constants";

interface ChatCompletionRequestMessage {
  role: string; // Define the role property
  content: string; // Assuming content is a string, adjust the type if necessary
}

const ConversationPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const { trackAPIRequest } = useRealtimeAnalytics();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (isLoading) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const startTime = Date.now();
    try {
      const userMessage: ChatCompletionRequestMessage = { role: "user", content: values.prompt };
      const newMessages = [...messages, userMessage];
      
      setMessages((current) => [...current, userMessage]);
      form.reset();
      
      const response = await axios.post('/api/conversation', { messages: newMessages });
      setMessages((current) => [...current, response.data]);
      
      // Track API request for analytics
      const duration = Date.now() - startTime;
      trackAPIRequest('conversation', duration, true);
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      trackAPIRequest('conversation', duration, false);
      
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      router.refresh();
    }
  }

  const suggestedQuestions = [
    "Explain quantum computing in simple terms",
    "Write a creative story about AI",
    "Help me plan a healthy meal",
    "What are the latest trends in technology?",
    "How can I improve my productivity?",
    "Explain machine learning concepts"
  ];

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">AI Conversation</h1>
                <p className="text-slate-600">Chat with our advanced AI assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 && !isLoading && (
            <div className="max-w-4xl mx-auto">
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-4">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to AI Chat</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  I'm your intelligent AI assistant. Ask me anything - from complex questions to creative tasks. 
                  I'm here to help with accurate, real-time responses.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <Card 
                    key={index}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm border-white/20"
                    onClick={() => form.setValue('prompt', question)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-slate-700">{question}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-start space-x-4 p-6 rounded-2xl",
                  message.role === "user" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-12" 
                    : "bg-white/80 backdrop-blur-sm border border-white/20 mr-12"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  message.role === "user" 
                    ? "bg-white/20" 
                    : "bg-gradient-to-r from-violet-500 to-purple-600"
                )}>
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm">
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {message.role === "user" ? "User" : "AI"}
                    </Badge>
                  </div>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    message.role === "user" ? "text-white" : "text-slate-700"
                  )}>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 mr-12">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm text-slate-700">AI Assistant</span>
                    <Badge variant="secondary" className="text-xs">AI</Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-slate-500 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-white/20 p-6">
          <div className="max-w-4xl mx-auto">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="flex items-center space-x-4"
              >
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          className="h-12 border-0 bg-white/80 backdrop-blur-sm rounded-xl px-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          disabled={isLoading} 
                          placeholder="Ask me anything... I'm here to help!" 
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !form.watch('prompt')?.trim()} 
                  className="h-12 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl"
                >
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </Form>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => form.setValue('prompt', '')}
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => setMessages([])}
                >
                  New Chat
                </Button>
              </div>
              <div className="text-xs text-slate-400">
                Powered by Advanced AI • Real-time responses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   );
}
 
export default ConversationPage;

