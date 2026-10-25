import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PLATFORMS } from "../assets/assets";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  EyeIcon,
  HistoryIcon,
  Loader2Icon,
  SparklesIcon,
  TimerIcon,
  Wand2Icon,
  XIcon,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const AIComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generateImage, setGenerateImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);

  // Post Preview & View on Screen state
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Scheduling state
  const [activeScheduler, setActiveScheduler] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Post copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchInitData = async () => {
    try {
      const [genRes, accRes] = await Promise.all([
        api.get("/api/posts/generations"),
        api.get("/api/accounts"),
      ]);
      setGenerations(genRes.data);
      setConnectedPlatforms(
        accRes.data
          .filter((a: any) => a.status === "connected")
          .map((a: any) => a.platform)
      );
    } catch (err) {
      console.error("Failed to load initial composer data:", err);
    }
  };

  useEffect(() => {
    fetchInitData();
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await api.post("/api/posts/generate", {
        prompt,
        tone,
        generateImage
      });
      setGenerations((prev) => [res.data, ...prev]);
      setPrompt("");
      toast.success("Content generated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!activeScheduler || selectedPlatforms.length === 0 || !scheduledDate || !scheduledTime) {
      toast.error("Please fill all scheduling fields");
      return;
    }

    // Verify all selected platforms are connected
    const missingAccounts = selectedPlatforms.filter((p) => !connectedPlatforms.includes(p));
    if (missingAccounts.length > 0) {
      const names = missingAccounts
        .map((p) => PLATFORMS.find((item) => item.id === p)?.name || p)
        .join(", ");
      toast.error(`Please add/connect your ${names} account in the Accounts tab before scheduling.`, {
        duration: 5000,
      });
      return;
    }

    setScheduling(true);
    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      await api.post("/api/posts", {
        content: activeScheduler.content,
        mediaUrl: activeScheduler.mediaUrl,
        mediaType: activeScheduler.mediaType,
        platforms: selectedPlatforms,
        scheduledFor,
        status: "scheduled",
      });
      toast.success("AI Post scheduled successfully!");
      setActiveScheduler(null);
      setSelectedPlatforms([]);
      setScheduledDate("");
      setScheduledTime("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to schedule");
    } finally {
      setScheduling(false);
    }
  };

  const tones = ["Professional", "Creative", "Funny", "Minimalist", "Excited"];

  return (
    <>
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
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer disabled:opacity-70 transition-all"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>{generateImage ? "Creating Post & Image..." : "Generating..."}</span>
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
              onClick={() => setSelectedPost(gen)}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-red-300 hover:shadow-lg transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                    {new Date(gen.createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs text-red-500 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full font-medium">
                    {gen.tone}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {gen.content}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium mt-2 group-hover:underline">
                    <EyeIcon className="size-3" /> Click to view full post
                  </span>
                </div>

                {gen.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mt-2">
                    <img
                      src={gen.mediaUrl}
                      alt="Gen"
                      className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPost(gen);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                  title="View full post"
                >
                  <EyeIcon className="size-3.5" />
                  View
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveScheduler(gen);
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 text-xs py-2 rounded-lg transition-all font-medium flex items-center justify-center gap-1.5"
                >
                  <CalendarIcon className="size-3.5" />
                  Schedule Post
                </button>
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
      </div>

      {/* Full Generated Post Viewer Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 min-h-screen z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <SparklesIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-semibold text-base leading-tight">Generated Post</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(selectedPost.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                  {selectedPost.tone}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Close preview"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Prompt box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Wand2Icon className="size-3 text-red-500" />
                  Original Prompt
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedPost.prompt}</p>
              </div>

              {/* Post content */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative group">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Post Content</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedPost.content)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-red-50 transition cursor-pointer"
                  >
                    {copied ? <CheckIcon className="size-3.5 text-emerald-600" /> : <CopyIcon className="size-3.5" />}
                    {copied ? "Copied!" : "Copy Post"}
                  </button>
                </div>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
                  {selectedPost.content}
                </p>
              </div>

              {/* Media image if present */}
              {selectedPost.mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={selectedPost.mediaUrl}
                    alt="Generated Media"
                    className="w-full max-h-96 object-contain bg-slate-900/5"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopy(selectedPost.content)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition inline-flex items-center gap-1.5"
              >
                {copied ? <CheckIcon className="size-4 text-emerald-600" /> : <CopyIcon className="size-4" />}
                {copied ? "Copied!" : "Copy Content"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const postToSchedule = selectedPost;
                    setSelectedPost(null);
                    setActiveScheduler(postToSchedule);
                  }}
                  className="px-5 py-2 text-xs sm:text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-xs transition flex items-center gap-1.5"
                >
                  <CalendarIcon className="size-4" />
                  Schedule This Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs text-slate-600 uppercase tracking-widest">
                      Select Channels
                    </label>
                    <Link
                      to="/accounts"
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Manage Accounts →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {PLATFORMS.map((p) => {
                      const active = selectedPlatforms.includes(p.id);
                      const isConnected = connectedPlatforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          title={isConnected ? `${p.name} (Connected)` : `${p.name} (Not Connected)`}
                          onClick={() =>
                            setSelectedPlatforms((prev) =>
                              prev.includes(p.id)
                                ? prev.filter((x) => x !== p.id)
                                : [...prev, p.id],
                            )
                          }
                          className={`relative p-2.5 rounded-lg border text-xs transition cursor-pointer ${active ? "bg-red-500 text-white border-red-500 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                        >
                          <p.icon className="size-4.5" />
                          <span
                            className={`absolute -top-1 -right-1 size-2 rounded-full border border-white ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {selectedPlatforms.some((p) => !connectedPlatforms.includes(p)) && (
                    <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
                      <span>
                        Account not connected for:{" "}
                        <strong>
                          {selectedPlatforms
                            .filter((p) => !connectedPlatforms.includes(p))
                            .map((p) => PLATFORMS.find((item) => item.id === p)?.name || p)
                            .join(", ")}
                        </strong>
                      </span>
                      <Link to="/accounts" className="text-red-600 font-semibold underline shrink-0 ml-2">
                        Connect
                      </Link>
                    </div>
                  )}
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
    </>
  );
};

export default AIComposer;
