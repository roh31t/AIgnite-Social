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
