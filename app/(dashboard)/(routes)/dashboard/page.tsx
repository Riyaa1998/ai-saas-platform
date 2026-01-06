"use client";

import { ArrowRight, Sparkles, Zap, TrendingUp, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { tools } from "@/constants";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Title */}
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Advanced AI
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  AI SaaS Platform with
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600">
                  Real-Time Analytics Dashboard
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Unleash the power of artificial intelligence with our comprehensive suite of tools, 
                backed by <span className="font-semibold text-blue-600">live analytics</span> and 
                <span className="font-semibold text-purple-600"> real-time insights</span>.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">10x Faster</h3>
                <p className="text-slate-600 text-sm">Content Generation</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Real-Time</h3>
                <p className="text-slate-600 text-sm">Analytics & Insights</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Live</h3>
                <p className="text-slate-600 text-sm">Performance Monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Choose Your AI Tool
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select from our comprehensive suite of AI-powered tools, each designed to enhance your productivity and creativity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card 
                onClick={() => router.push(tool.href)} 
                key={tool.href} 
                className="group p-6 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={cn("p-4 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300", tool.bgColor)}>
                    <tool.icon className={cn("w-8 h-8", tool.color)} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                      {tool.label}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {tool.description || "Unlock the power of AI with this advanced tool"}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
