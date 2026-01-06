"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mic, Upload, StopCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";

const SpeechToTextPage = () => {
  const router = useRouter();
  const [transcript, setTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  // Function to start recording audio
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
        setAudioFile(file);
        
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (error) {
      toast.error("Could not access microphone. Please check permissions.");
      console.error("Error accessing microphone:", error);
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Function to format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to transcribe the audio
  const transcribeAudio = async () => {
    if (!audioFile) {
      toast.error("Please upload or record an audio file first.");
      return;
    }

    try {
      setIsTranscribing(true);
      setTranscript("");

      const formData = new FormData();
      formData.append('audio', audioFile);
      
      const response = await axios.post("/api/speech-to-text", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setTranscript(response.data.text);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("You have reached your free tier limit. Please upgrade to continue.");
      } else {
        toast.error("Error transcribing audio. Please try again.");
        console.error("Transcription error:", error);
      }
    } finally {
      setIsTranscribing(false);
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Speech to Text"
        description="Convert speech to text with our advanced AI technology."
        icon={Mic}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <div className="px-4 lg:px-8">
        <div className="mb-4 flex rounded-md overflow-hidden border">
          <button 
            className={`flex-1 py-2 text-center ${activeTab === "record" ? "bg-primary text-white" : "bg-transparent"}`}
            onClick={() => setActiveTab("record")}
          >
            Record Audio
          </button>
          <button 
            className={`flex-1 py-2 text-center ${activeTab === "upload" ? "bg-primary text-white" : "bg-transparent"}`}
            onClick={() => setActiveTab("upload")}
          >
            Upload Audio
          </button>
        </div>
        
        {activeTab === "record" && (
          <Card className="mb-4">
            <CardContent className="pt-6 text-center">
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <div className="mb-4 text-2xl font-semibold">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="w-20 h-20 rounded-full bg-red-500 animate-pulse flex items-center justify-center mb-4">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <Button 
                    onClick={stopRecording} 
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <StopCircle className="h-4 w-4" />
                    Stop Recording
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Button 
                    onClick={startRecording} 
                    className="flex items-center gap-2 mb-4"
                  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </Button>
                  {audioFile && (
                    <div className="text-sm text-muted-foreground">
                      Ready to transcribe: {audioFile.name}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === "upload" && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <label className="cursor-pointer bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 mb-2">
                  Choose File
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  {audioFile ? `Selected: ${audioFile.name}` : "WAV, MP3, M4A (max 10MB)"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-4">
          <Button 
            onClick={transcribeAudio} 
            disabled={!audioFile || isTranscribing} 
            className="w-full"
          >
            {isTranscribing ? "Transcribing..." : "Transcribe Audio"}
          </Button>
        </div>
        
        {isTranscribing && (
          <div className="p-8 rounded-lg w-full flex items-center justify-center mt-4">
            <Loader />
          </div>
        )}
        
        {transcript && !isTranscribing && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Transcript</h3>
              <div className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
                {transcript}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SpeechToTextPage; 