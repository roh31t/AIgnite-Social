import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PLATFORMS } from "../assets/assets";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  SendIcon,
  XIcon,
} from "lucide-react";

const Scheduler = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [MediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const fetchSchedulerData = async () => {
    try {
      const [postsRes, accountsRes] = await Promise.all([
        api.get("/api/posts"),
        api.get("/api/accounts"),
      ]);
      setPosts(postsRes.data);
      setConnectedPlatforms(
        accountsRes.data
          .filter((a: any) => a.status === "connected")
          .map((a: any) => a.platform)
      );
    } catch (error) {
      console.error("Failed to fetch scheduler data:", error);
    }
  };

  useEffect(() => {
    fetchSchedulerData();
  }, []);

  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");

  const toggleplatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
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

    if (!scheduledDate || !scheduledTime) {
      toast.error("Please select date and time");
      return;
    }
    setLoading(true);
    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      const formData = new FormData();
      formData.append("content", content);
      formData.append("platforms", JSON.stringify(selectedPlatforms));
      formData.append("scheduledFor", scheduledFor);
      formData.append("status", "scheduled");
      if (MediaFile) {
        formData.append("media", MediaFile);
      }

      const res = await api.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts((prev) => [res.data, ...prev]);
      setContent("");
      setSelectedPlatforms([]);
      setMediaFile(null);
      setScheduledDate("");
      setScheduledTime("");
      toast.success("Post scheduled successfully!");
    } catch (error: any) {
      console.error("Failed to schedule post:", error);
      toast.error(error?.response?.data?.message || "Failed to schedule post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/*compose panel*/}
      <div className="w-full lg:w-[460px] shrink-0">
        <div className="bg-white rounded-2xl border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg text-slate-700">Compose Post</h2>
          </div>
          <form className="space-y-5" onSubmit={handleSchedule}>
            {/* Platform */}
            <div className="">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs text-slate-500 uppercase">
                  Platforms
                </label>
                <Link
                  to="/accounts"
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Manage Accounts →
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  const isConnected = connectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={isConnected ? `${p.name} (Connected)` : `${p.name} (Not Connected)`}
                      onClick={() => toggleplatform(p.id)}
                      className={`relative flex items-center gap-1.5 p-3 rounded-lg border transition-all duration-150 ${active ? "bg-red-50 border-red-300 text-red-500 scale-103" : "border-slate-200 text-slate-500 hover:border-slate-300"} cursor-pointer`}
                    >
                      <p.icon className="size-4.5" />
                      {/* Connection status indicator */}
                      <span
                        className={`absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-white ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                    </button>
                  );
                })}
              </div>
              {/* Unconnected platform warning banner */}
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

            {/*content */}
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-2">
                Content
              </label>
              <textarea
                required
                rows={5}
                placeholder="what do you want to share today?"
                className="w-full px-5 py-4 bg-slate-50 border-slate-200 rounded-2xl text-slate-900 text-sm placeholder-slate-400 outline-none resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div
                className={`text-right text-xs mt-1 font-medium ${content.length > 270 ? "text-red-500" : "text-slate-400"}`}
              >
                {content.length}/280
              </div>
            </div>

            {/* Media upload */}
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-2">
                Media(optional)
              </label>

              {MediaFile ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  {MediaFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(MediaFile)}
                      alt="preview"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(MediaFile)}
                      className="w-full h-40 object-cover"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaFile(null)}
                    className="absolute top-2 right-2 size-7 bg-slate-900/80 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-5 py-10 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all group">
                  <span className="text-sm text-slate-500 group-hover:text-red-600 transition-colors">
                    Click to upload image or video
                  </span>
                  <input
                    type="file"
                    accept="image/*, video/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && setMediaFile(e.target.files[0])
                    }
                  />
                </label>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
              <div>
                <label className="block text-xs text-slate-500 uppercase mb-2">
                  Date
                </label>
                <div className="relative">
                  <CalendarIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg text-slate-900 text-small outline-none"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 uppercase mb-2">
                  Time
                </label>
                <div className="relative">
                  <ClockIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="time"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg text-slate-900 text-small outline-none"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 transition-all text-white rounded-lg"
            >
              {loading ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  Schedule Post
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      {/* Queue Panel */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/*upcoming post*/}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 ">
            <CalendarDaysIcon className="size-4 text-zinc-500" />
            <h3 className="text-slate-900 text-sm">Upcoming</h3>
            <span className="ml-auto text-xs font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
              {scheduled.length}
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-slate-50">
            {scheduled.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No Posts Scheduled yet{" "}
              </div>
            ) : (
              scheduled.map((post) => (
                <div
                  key={post._id}
                  className="px-5 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1.5 items-center">
                      {(post.platforms || []).map((pl: string) => {
                        const meta = PLATFORMS.find((p) => p.id === pl);
                        return meta ? (
                          <meta.icon
                            key={pl}
                            className="size-3.5 text-slate-400"
                          />
                        ) : null;

                      })}
                    </div>   
                    <div className="flex items-center gap-2" >
                      {post.mediaType && <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md font-semibold capitalize">{post.mediaType}</span>}
                      <span>{new Date(post.scheduledFor).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 max-w-md">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/*Published Post*/}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 ">
            <SendIcon className="size-4 text-zinc-500" />
            <h3 className="text-slate-900 text-sm">Published</h3>
            <span className="ml-auto text-xs font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
              {published.length}
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-slate-50">
            {published.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No Published Post yet.{" "}
              </div>
            ) : (
              published.map((post) => (
                <div
                  key={post._id}
                  className="px-5 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1.5 items-center">
                      {(post.platforms || []).map((pl: string) => {
                        const meta = PLATFORMS.find((p) => p.id === pl);
                        return meta ? (
                          <meta.icon
                            key={pl}
                            className="size-3.5 text-slate-400"
                          />
                        ) : null;

                      })}
                    </div>   
                    <div className="flex items-center gap-2" >
                      {post.mediaType && <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md font-semibold capitalize">{post.mediaType}</span>}
                      <span>{new Date(post.updatedAt).toLocaleString()}</span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">Published</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 max-w-4/5">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
