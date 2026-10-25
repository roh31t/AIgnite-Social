import {
  ActivityIcon,
  AlertCircleIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  LayersIcon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  Share2Icon,
  SparklesIcon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { PLATFORMS } from "../assets/assets";
import toast from "react-hot-toast";

type TabType = "all" | "scheduled" | "published" | "activity";

const Dashboard = () => {
  const [stats, setStats] = useState({
    scheduled: 0,
    published: 0,
    connectedAccounts: 0,
    totalPosts: 0,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Full Screen Post Preview Modal State
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const [postsResult, accountsResult, activityResult] = await Promise.allSettled([
        api.get("/api/posts"),
        api.get("/api/accounts"),
        api.get("/api/activity"),
      ]);

      const fetchedPosts = postsResult.status === "fulfilled" ? postsResult.value.data || [] : [];
      const fetchedAccounts = accountsResult.status === "fulfilled" ? accountsResult.value.data || [] : [];
      const fetchedActivities = activityResult.status === "fulfilled" ? activityResult.value.data || [] : [];

      setPosts(fetchedPosts);
      setActivities(fetchedActivities);

      const scheduledCount = fetchedPosts.filter((p: any) => p.status === "scheduled").length;
      const publishedCount = fetchedPosts.filter((p: any) => p.status === "published").length;
      const connectedCount = fetchedAccounts.filter((a: any) => a.status === "connected").length;

      setStats({
        scheduled: scheduledCount,
        published: publishedCount,
        connectedAccounts: connectedCount,
        totalPosts: fetchedPosts.length,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Post content copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivityClick = (activity: any) => {
    if (activity.relatedPost && typeof activity.relatedPost === "object") {
      setSelectedPost(activity.relatedPost);
    } else {
      setSelectedPost({
        content: activity.description,
        status: activity.actionType === "POST_PUBLISHED" ? "published" : "scheduled",
        scheduledFor: activity.createdAt,
        platforms: activity.platform ? [activity.platform] : [],
      });
    }
  };

  const statCards = [
    {
      label: "Scheduled Posts",
      value: stats.scheduled,
      icon: ClockIcon,
      trend: "Upcoming queue",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Published Posts",
      value: stats.published,
      icon: CheckCircleIcon,
      trend: "Live & delivered",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Connected Accounts",
      value: stats.connectedAccounts,
      icon: Share2Icon,
      trend: "Active channels",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: LayersIcon,
      trend: "All-time",
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
  ];

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "scheduled") return p.status === "scheduled";
    if (activeTab === "published") return p.status === "published";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircleIcon className="size-3" /> Published
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <ClockIcon className="size-3" /> Scheduled
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            <AlertCircleIcon className="size-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            {status}
          </span>
        );
    }
  };

  const getActivityBadge = (actionType: string) => {
    switch (actionType) {
      case "POST_PUBLISHED":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            Published
          </span>
        );
      case "POST_SCHEDULED":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            Scheduled
          </span>
        );
      case "POST_FAILED":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">
            Failed
          </span>
        );
      default:
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
            Event
          </span>
        );
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Top Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Social Command Center 👋</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Monitor all your live publishing statuses, scheduled queues, and connected social channels.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-medium transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCwIcon className={`size-4 ${refreshing ? "animate-spin text-red-500" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/schedule"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              <PlusIcon className="size-4" />
              <span>Schedule Post</span>
            </Link>
            <Link
              to="/ai-composer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              <SparklesIcon className="size-4 text-amber-400" />
              <span>AI Composer</span>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <card.icon className="size-5" />
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <TrendingUpIcon className="size-3 text-emerald-500" />
                  {card.trend}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">{card.value}</div>
              <p className="text-sm text-slate-500 mt-1 font-medium">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Posts & Status Manager */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Navigation Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">Post Status & Queue</h3>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {posts.length} total
              </span>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === "scheduled" ? "bg-white text-amber-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Scheduled ({stats.scheduled})
              </button>
              <button
                onClick={() => setActiveTab("published")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === "published" ? "bg-white text-emerald-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Published ({stats.published})
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === "activity" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Activity Feed ({activities.length})
              </button>
            </div>
          </div>

          {/* Content Section */}
          {activeTab === "activity" ? (
            /* Activity Feed View */
            activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="size-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                  <ActivityIcon className="size-6" />
                </div>
                <p className="text-slate-700 font-medium">No activity logged yet</p>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">
                  Schedule or publish posts to see live event logs and status updates here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    onClick={() => handleActivityClick(activity)}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 group-hover:bg-red-50 text-slate-600 group-hover:text-red-500 transition">
                      <SendIcon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {getActivityBadge(activity.actionType)}
                          <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 font-medium text-red-600">
                            <EyeIcon className="size-3" /> View details
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 font-mono">
                          {new Date(activity.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 group-hover:text-slate-900 transition">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Posts List View */
            filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="size-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                  <CalendarDaysIcon className="size-6" />
                </div>
                <p className="text-slate-700 font-medium">
                  No {activeTab !== "all" ? activeTab : ""} posts found
                </p>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">
                  Use the Scheduler or AI Composer to create posts and they will appear right here with live statuses.
                </p>
                <Link
                  to="/schedule"
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Schedule Your First Post
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => setSelectedPost(post)}
                    className="p-5 sm:px-6 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >
                    {/* Left: Content & Platforms */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Media Thumbnail */}
                      {post.mediaUrl && (
                        <img
                          src={post.mediaUrl}
                          alt="media preview"
                          className="size-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-xs group-hover:border-red-300 transition"
                        />
                      )}

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status Badge */}
                          {getStatusBadge(post.status)}

                          {/* Platform Icons */}
                          <div className="flex items-center gap-1.5 ml-1">
                            {(post.platforms || []).map((pl: string) => {
                              const meta = PLATFORMS.find((p) => p.id === pl);
                              return meta ? (
                                <span
                                  key={pl}
                                  title={meta.name}
                                  className="size-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600"
                                >
                                  <meta.icon className="size-3.5" />
                                </span>
                              ) : null;
                            })}
                          </div>

                          <span className="text-xs text-red-600 font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1 ml-auto sm:ml-2">
                            <EyeIcon className="size-3" /> Click to view
                          </span>
                        </div>

                        <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed group-hover:text-slate-950 transition">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    {/* Right: Date & Time Info */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 text-xs text-slate-500 gap-1 pl-4 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className="font-medium text-slate-700">
                        {post.status === "published" ? "Published At:" : "Scheduled For:"}
                      </span>
                      <span className="font-mono text-slate-600">
                        {post.status === "published"
                          ? new Date(post.updatedAt || post.scheduledFor).toLocaleString()
                          : new Date(post.scheduledFor).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* FULL POST PREVIEW MODAL ON SCREEN */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedPost.status || "scheduled")}
                <span className="text-xs font-semibold text-slate-400">Post Details</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Media Preview if attached */}
              {selectedPost.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center shadow-xs">
                  {selectedPost.mediaType === "video" ? (
                    <video
                      src={selectedPost.mediaUrl}
                      controls
                      className="w-full max-h-80 object-contain"
                    />
                  ) : (
                    <img
                      src={selectedPost.mediaUrl}
                      alt="post media"
                      className="w-full max-h-96 object-contain"
                    />
                  )}
                </div>
              )}

              {/* Full Content */}
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Post Content
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap select-text">
                  {selectedPost.content}
                </div>
              </div>

              {/* Target Platforms */}
              {selectedPost.platforms && selectedPost.platforms.length > 0 && (
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                    Target Platforms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.platforms.map((pl: string) => {
                      const meta = PLATFORMS.find((p) => p.id === pl);
                      return meta ? (
                        <div
                          key={pl}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs"
                        >
                          <meta.icon className="size-4 text-slate-500" />
                          <span>{meta.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Metadata Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                {selectedPost.scheduledFor && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Scheduled For</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {new Date(selectedPost.scheduledFor).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedPost.updatedAt && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Last Updated</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {new Date(selectedPost.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-3">
              <button
                onClick={() => handleCopy(selectedPost.content)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <CheckIcon className="size-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="size-4 text-slate-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to="/schedule"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <span>Open in Scheduler</span>
                  <ExternalLinkIcon className="size-3.5" />
                </Link>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;