<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { SparklesIcon, Loader2Icon, ImagePlusIcon, HistoryIcon, AlignLeftIcon } from 'lucide-react';

interface Generation {
    _id: string;
    prompt: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    tone: string;
    createdAt: string;
}

export default function AIComposer() {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('Professional');
    const [generateImage, setGenerateImage] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);

    const tones = ['Professional', 'Casual', 'Funny', 'Inspirational', 'Informative', 'Sarcastic'];

    const fetchGenerations = async () => {
        try {
            const { data } = await api.get('/api/posts/generations');
            setGenerations(data);
            if (data.length > 0 && !currentGeneration) {
                setCurrentGeneration(data[0]);
            }
        } catch (error: any) {
            console.error("Failed to fetch generations", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchGenerations();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return toast.error("Please enter a prompt");

        setIsLoading(true);
        try {
            const { data } = await api.post('/api/posts/generate', {
                prompt,
                tone,
                generateImage
            });
            setCurrentGeneration(data);
            setGenerations(prev => [data, ...prev]);
            toast.success("Generation complete!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Generation failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-8">
            {/* Left side: Composer Form */}
            <div className="w-full md:w-1/2 flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <SparklesIcon className="size-6 text-red-500" />
                        AI Composer
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Generate high-quality social media posts and images in seconds.</p>
                </div>

                <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">What do you want to post about?</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A launch announcement for our new AI feature..."
                            className="w-full min-h-[120px] rounded-lg border-slate-200 border p-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tone of Voice</label>
                            <select 
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full rounded-lg border-slate-200 border p-2.5 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-white"
                            >
                                {tones.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col justify-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={generateImage}
                                        onChange={(e) => setGenerateImage(e.target.checked)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex items-center gap-1.5">
                                    <ImagePlusIcon className="size-4" />
                                    Generate Image
                                </span>
                            </label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <><Loader2Icon className="size-5 animate-spin" /> Generating...</>
                        ) : (
                            <><SparklesIcon className="size-5" /> Generate Post</>
                        )}
                    </button>
                </form>

                {/* History Section */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
                        <HistoryIcon className="size-5 text-slate-400" />
                        Recent Generations
                    </h3>
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {generations.length === 0 ? (
                            <div className="text-center py-6 text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">
                                No history yet.
                            </div>
                        ) : (
                            generations.map((gen) => (
                                <div 
                                    key={gen._id} 
                                    onClick={() => setCurrentGeneration(gen)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${currentGeneration?._id === gen._id ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-red-200'}`}
                                >
                                    <p className="text-sm font-medium text-slate-800 truncate">{gen.prompt}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">{gen.tone}</span>
                                        <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right side: Results */}
            <div className="w-full md:w-1/2 flex flex-col h-full">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <AlignLeftIcon className="size-5 text-slate-400" />
                        Result Preview
                    </h3>
                    
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Loader2Icon className="size-10 animate-spin text-red-300" />
                            <p className="text-sm">Creating your masterpiece...</p>
                        </div>
                    ) : currentGeneration ? (
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-5">
                            {currentGeneration.mediaUrl && (
                                <div className="w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                    <img src={currentGeneration.mediaUrl} alt="Generated" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm leading-relaxed">
                                {currentGeneration.content}
                            </div>
                            
                            <div className="mt-auto pt-4 flex gap-3">
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(currentGeneration.content);
                                        toast.success("Copied to clipboard!");
                                    }}
                                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg transition-colors text-sm"
                                >
                                    Copy Text
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <SparklesIcon className="size-12 text-slate-200" />
                            <p className="text-sm">Your generated content will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
=======
import { useEffect, useState } from "react";
import { dummyGenerationData, PLATFORMS } from "../assets/assets";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  HistoryIcon,
  Loader2Icon,
  TimerIcon,
  Wand2Icon,
  XIcon,
} from "lucide-react";
// import api from "../api/axios";
// import toast from "react-hot-toast";

const AIComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generateImage, setGenerateImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);

  // Scheduling state
  const [activeScheduler, setActiveScheduler] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const fetchGenerations = async () => {
    setGenerations(dummyGenerationData);
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  const handleSchedule = async () => {
    setScheduling(true);
    setTimeout(() => {
      setScheduling(false);
    }, 2000);
  };

  //   const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
  //   setScheduling(true);
  //   try {
  //     await api.post("/api/posts", {
  //       content: activeScheduler.content,
  //       mediaUrl: activeScheduler.mediaUrl,
  //       mediaType: activeScheduler.mediaType,
  //       platforms: selectedPlatforms,
  //       scheduledFor,
  //       status: "scheduled",
  //     })
  //       toast.success("AI Post scheduled!");
  //       setActiveScheduler(null)
  //       setSelectedPlatforms([]);
  //       setScheduledDate("");
  //       setScheduledTime("");
  //   } catch (error:any) {
  //     toast.error(error?.response?.data?.message || "Failed to schedule");
  //   }finally{
  //     setScheduling(false);
  //   }
  //  }

  const tones = ["Professional", "Creative", "Funny", "Minimalist", "Excited"];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Input Section */}
      <div className="space-y-6 text-center mt-20">
        <h1 className="text-3xl text-slate-700 tracking-tight">
          What should we create today?
        </h1>
        <div className="relative group mt-12">
          <textarea
            className="w-full px-6 py-6 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition resize-none h-40"
            placeholder="Share your idea... (e.g. A post about the launch of our new eco-friendly coffee beans)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute bottom-4 right-2.5 flex items-center gap-3 text-sm">
            <button
              onClick={() => setGenerateImage(!generateImage)}
              className="flex items-center gap-3 bg-red-50 py-2 px-3 rounded-lg"
            >
              <span>AI Image</span>
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${generateImage ? "bg-red-500" : "bg-slate-200"}`}
              >
                <span
                  className={`pointer-events-none size-4 transform translate-y-0.5 rounded-full bg-white transition ${generateImage ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </div>
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  Generate
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all border ${tone === t ? "bg-red-500 border-red-500 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* AI Generated Posts */}
      <div className="space-y-6 pt-12 border-t border-slate-100">
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5" />
            <h2 className="text-xl">Recent Generations</h2>
          </div>
          <span className="text-sm text-slate-500 bg-slate-50 px-2">
            {generations.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {generations.map((gen) => (
            <div
              key={gen._id}
              className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-red-200 transition-all relative overflow-hidden"
            >
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-widest">
                    {new Date(gen.createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                    {gen.tone}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                  {gen.content}
                </p>

                {gen.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-50 bg-slate-50">
                    <img
                      src={gen.mediaUrl}
                      alt="Gen"
                      className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveScheduler(gen)}
                    className="flex-1 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 text-xs py-2.5 rounded-lg transition-all"
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          ))}

          {generations.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-2">
              <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <Wand2Icon className="size-6" />
              </div>
              <p className="text-slate-400 text-sm">
                No content generated yet. Try generating some content using the
                AI.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scheduler Modal */}
      {activeScheduler && (
        <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-slate-900">Schedule Generation</h3>
              <button
                onClick={() => setActiveScheduler(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {activeScheduler.prompt}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {activeScheduler.content}
                </p>
                {activeScheduler.mediaUrl && (
                  <img
                    src={activeScheduler.mediaUrl}
                    alt="preview"
                    className="w-full aspect-video object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-50 space-y-8">
              {/* Options */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-slate-600 uppercase tracking-widest mb-4">
                    Select Channels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => {
                      const active = selectedPlatforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() =>
                            setSelectedPlatforms((prev) =>
                              prev.includes(p.id)
                                ? prev.filter((x) => x !== p.id)
                                : [...prev, p.id],
                            )
                          }
                          className={`p-2.5 rounded-md border text-xs ${active ? "bg-red-500/80 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}
                        >
                          <p.icon className="size-4.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <CalendarIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-md text-slate-900 text-sm focus:outline-none transition-all"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <ClockIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-md text-slate-900 text-sm focus:outline-none transition-all"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSchedule}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-md  bg-slate-200 text-slate-700 hover:bg-red-500 hover:text-white transition"
              >
                {scheduling ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <TimerIcon className="size-4" />
                )}
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIComposer;
>>>>>>> 70268fad140b4ac606f76666c42810099aaf6e9e
