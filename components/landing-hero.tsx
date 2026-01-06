"use client";

import TypewriterComponent from "typewriter-effect";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="text-white font-bold py-36 text-center space-y-5">
      <div className="space-y-8 max-w-4xl mx-auto px-4">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600">
              AI SaaS Platform with
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              Integrated Analytics
            </span>
          </h1>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-xl md:text-2xl h-8">
            <TypewriterComponent
              options={{
                strings: [
                  "Real-Time Analytics Dashboard",
                  "Advanced AI Tools",
                  "Live Performance Monitoring",
                  "Smart Data Insights"
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </div>
        </div>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full opacity-80"></div>
      </div>
      <div className="text-base md:text-xl font-light text-zinc-300 max-w-2xl mx-auto leading-relaxed">
        Transform your workflow with our AI-powered platform that delivers 10x faster content creation, 
        real-time analytics, and actionable insights - all in one place.
      </div>
      <div className="pt-6">
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button 
            variant="premium" 
            className="md:text-lg p-6 px-8 rounded-full font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Start Generating For Free
            </span>
          </Button>
        </Link>
      </div>
      <div className="text-zinc-400 text-sm md:text-base font-normal mt-4 flex items-center justify-center space-x-2">
        <span>🚀 No credit card required</span>
        <span className="text-zinc-600">•</span>
        <span>✨ Start in seconds</span>
      </div>
    </div>
  );
};
