<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CalendarIcon, ImagePlusIcon, Loader2Icon, SendIcon, XIcon, ClockIcon, ShareIcon } from 'lucide-react';
import { SiInstagram, SiFacebook } from '@icons-pack/react-simple-icons';

interface Account {
    _id: string;
    platform: string;
    handle: string;
    status: string;
}

interface Post {
    _id: string;
    content: string;
    platforms: string[];
    scheduledFor: string;
    status: string;
    mediaUrl?: string;
    createdAt: string;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
    twitter: ShareIcon,
    linkedin: ShareIcon,
    instagram: SiInstagram,
    facebook: SiFacebook,
};

export default function Scheduler() {
    const [content, setContent] = useState('');
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [scheduledFor, setScheduledFor] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            const [accountsRes, postsRes] = await Promise.all([
                api.get('/api/accounts'),
                api.get('/api/posts')
            ]);
            setAccounts(accountsRes.data);
            setPosts(postsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const uniquePlatforms = Array.from(new Set(accounts.filter(a => a.status === 'connected').map(a => a.platform)));

    const togglePlatform = (platform: string) => {
        setPlatforms(prev => 
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!content) return toast.error("Post content cannot be empty.");
        if (platforms.length === 0) return toast.error("Please select at least one platform.");
        if (!scheduledFor) return toast.error("Please select a date and time to schedule the post.");

        // Check if date is in the past
        if (new Date(scheduledFor) <= new Date()) {
            return toast.error("Scheduled time must be in the future.");
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("content", content);
        formData.append("platforms", JSON.stringify(platforms));
        formData.append("scheduledFor", scheduledFor);
        formData.append("status", "scheduled");
        if (mediaFile) {
            formData.append("media", mediaFile);
        }

        try {
            const { data } = await api.post('/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setPosts(prev => [data, ...prev]);
            toast.success("Post scheduled successfully!");
            
            // Reset form
            setContent('');
            setPlatforms([]);
            setScheduledFor('');
            removeMedia();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to schedule post");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-8">
            {/* Left side: Composer Form */}
            <div className="w-full md:w-[55%] flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="size-6 text-red-500" />
                        Scheduler
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Plan and schedule your social media posts across platforms.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
                    {/* Platforms */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Platforms</label>
                        {uniquePlatforms.length === 0 ? (
                            <div className="text-sm text-slate-500 border border-dashed rounded-lg p-3 text-center bg-slate-50">
                                You have no connected accounts. Please connect an account first.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {uniquePlatforms.map(platform => {
                                    const Icon = PLATFORM_ICONS[platform] || ShareIcon;
                                    const isSelected = platforms.includes(platform);
                                    return (
                                        <button
                                            key={platform}
                                            type="button"
                                            onClick={() => togglePlatform(platform)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                                isSelected 
                                                ? 'bg-red-50 border-red-500 text-red-700' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            <Icon className={`size-4 ${isSelected ? 'text-red-500' : 'text-slate-400'}`} />
                                            <span className="capitalize text-sm font-medium">{platform}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Post Content</label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What do you want to share?"
                            className="w-full min-h-[150px] rounded-lg border-slate-200 border p-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none resize-none"
                            required
                        />
                    </div>

                    {/* Media & Date Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Media Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Add Media (Optional)</label>
                            {mediaPreview ? (
                                <div className="relative w-full h-11 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center px-3 justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="h-7 w-7 rounded bg-slate-200 overflow-hidden shrink-0">
                                            {mediaFile?.type.startsWith('video') ? (
                                                <video src={mediaPreview} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={mediaPreview} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-600 truncate">{mediaFile?.name}</span>
                                    </div>
                                    <button type="button" onClick={removeMedia} className="text-slate-400 hover:text-red-500 shrink-0">
                                        <XIcon className="size-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input 
                                        type="file" 
                                        accept="image/*,video/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg h-11 text-sm text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition-colors bg-white"
                                    >
                                        <ImagePlusIcon className="size-4" />
                                        Upload Image or Video
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Date Time Picker */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Schedule For</label>
                            <input 
                                type="datetime-local" 
                                value={scheduledFor}
                                onChange={(e) => setScheduledFor(e.target.value)}
                                className="w-full rounded-lg border-slate-200 border p-2.5 h-11 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none text-sm text-slate-700 bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <><Loader2Icon className="size-5 animate-spin" /> Scheduling...</>
                            ) : (
                                <><SendIcon className="size-5" /> Schedule Post</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right side: Scheduled Posts */}
            <div className="w-full md:w-[45%] flex flex-col h-full">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex-1 flex flex-col h-[600px]">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <ClockIcon className="size-5 text-slate-400" />
                        Scheduled & Published Posts
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                        {posts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-2 h-32 border border-dashed border-slate-200 rounded-lg">
                                <p className="text-sm">No posts scheduled yet.</p>
                            </div>
                        ) : (
                            posts.map(post => {
                                const isScheduled = post.status === 'scheduled';
                                const isPublished = post.status === 'published';
                                
                                return (
                                    <div key={post._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-1.5">
                                                {post.platforms.map(p => {
                                                    const Icon = PLATFORM_ICONS[p];
                                                    return Icon ? <Icon key={p} className="size-4 text-slate-400" /> : null;
                                                })}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                                isScheduled ? 'bg-amber-100 text-amber-700' : 
                                                isPublished ? 'bg-emerald-100 text-emerald-700' : 
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {post.status}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-slate-700 mb-3 line-clamp-3 leading-relaxed">
                                            {post.content}
                                        </p>
                                        
                                        {post.mediaUrl && (
                                            <div className="h-24 w-full bg-slate-100 rounded-md overflow-hidden mb-3">
                                                {post.mediaUrl.includes('video') ? (
                                                    <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={post.mediaUrl} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <CalendarIcon className="size-3.5" />
                                            {new Date(post.scheduledFor).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
=======
import { useEffect, useState } from "react"
import { PLATFORMS,dummyPostsData } from "../assets/assets";
import { ArrowRightIcon, CalendarDaysIcon, CalendarIcon, ClockIcon, SendIcon, XIcon } from "lucide-react";


const Scheduler = () => {

  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setPosts(dummyPostsData);
  };

  useEffect(()=>{
    (async ()=> await fetchPosts())();
    const interval = setInterval(async ()=> await fetchPosts(), 10000);
    return ()=> clearInterval(interval)
  },[])

  const scheduled = posts.filter((p)=> p.status === "scheduled")
  const published = posts.filter((p)=> p.status === "published")

  const togglePlatform = (id: string)=> setSelectedPlatforms((prev)=> (prev.includes(id) ? prev.filter((p)=> p !== id) : [...prev, id])) 

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPosts((prev) => [...prev, dummyPostsData[0]]);
    }, 1000);
  };

    // const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    // const formData = new FormData();
    // formData.append("content", content);
    // formData.append("scheduledFor", scheduledFor);
    // formData.append("status", "scheduled");
    // formData.append("platforms", JSON.stringify(selectedPlatforms));
    // if(mediaFile) formData.append("media", mediaFile);

    // setLoading(true)
    // try {
    //   await api.post("/api/posts", formData, {headers: {"Content-Type": "multipart/form-data"}})
    //   toast.success("Post scheduled!");
    //   setContent("");
    //   setScheduledDate("");
    //   setScheduledTime("");
    //   setSelectedPlatforms([]);
    //   setMediaFile(null);
    //   fetchPosts();
    // } catch (error:any) {
    //   toast.error(error?.response?.data?.message || error.message);
    // }finally{
    //   setLoading(false);
    // }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* ── Compose panel ── */}
      <div className="w-full lg:w-[460px] shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg text-slate-700">Compose Post</h2>
            </div>

            <form className="space-y-5" onSubmit={handleSchedule}>
              {/* Platforms */}
              <div>
                <label className="block text-xs text-slate-500 uppercase mb-2">Platforms</label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map((p)=>{
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button key={p.id} type="button" onClick={()=> togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 p-3 rounded-md border transition-all duration-150 ${active ? "bg-red-50 border-red-300 text-red-500 scale-103" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        <p.icon className="size-4.5" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs text-slate-500 uppercase mb-2">Content</label>
                <textarea required rows={5} placeholder="What do you want to share today?" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder-slate-400 outline-none resize-none" value={content} onChange={(e)=>setContent(e.target.value)}/>
                  <div className={`text-right text-xs mt-1 font-medium ${content.length > 270 ? "text-red-500" : "text-slate-400"}`}>
                    {content.length}/280
                  </div>
              </div>

              {/* Media upload */}
              <div>
                <label className="block text-xs text-slate-500 uppercase mb-2">Media (optional)</label>
                {mediaFile ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {mediaFile.type.startsWith("image/") 
                    ? 
                    <img src={URL.createObjectURL(mediaFile)} alt="preview" className="w-full h-40 object-cover"/> 
                    : 
                    <video src={URL.createObjectURL(mediaFile)} className="w-full h-40 object-cover" controls/>}

                    <button type="button" onClick={()=> setMediaFile(null)} className="absolute top-2 right-2 size-7 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full flex items-center justify-center transition-colors">
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-5 py-10 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all group">
                    <span className="text-sm text-slate-500 group-hover:text-red-600 transition-colors">Click to upload image or video</span>
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={(e)=>e.target.files?.[0] && setMediaFile(e.target.files[0])}/>
                  </label>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 uppercase mb-2">Date</label>
                  <div className="relative">
                    <CalendarIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    <input type="date" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" value={scheduledDate} onChange={(e)=>setScheduledDate(e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase mb-2">Date</label>
                  <div className="relative">
                    <ClockIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>

                    <input type="time" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" value={scheduledTime} onChange={(e)=>setScheduledTime(e.target.value)}/>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 transition-all text-white rounded-lg">
                {loading ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scheduling…
                  </>
                ) : (
                  <>
                    Schedule Post
                    <ArrowRightIcon className="size-4"/>
                  </>
                )}
              </button>
            </form>
        </div>
      </div>

      {/* ── Queue panels ── */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <CalendarDaysIcon className="size-4 text-zinc-500"/>
                <h3 className="text-slate-900 text-sm">Upcoming</h3>
                <span className="ml-auto text-xs font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">{scheduled.length}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {scheduled.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">No posts scheduled yet</div>
                ) : (
                  scheduled.map((post)=>(
                    <div key={post._id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-1.5 items-center">
                            {post.platforms.map((pl: string)=>{
                              const meta = PLATFORMS.find((p)=> p.id ===  pl);
                              return meta ? <meta.icon key={pl} className="size-3.5 text-slate-400"/> : null
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            {post.mediaType && <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md font-semibold capitalize">{post.mediaType}</span>}

                            <span className="text-xs text-slate-400">{new Date(post.scheduledFor).toLocaleString()}</span>
                          </div>
                      </div>
                          <p className="text-sm text-slate-500 line-clamp-2 max-w-md">{post.content}</p>
                    </div>
                  ))
                )}
              </div>
        </div>

        {/* Published */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <SendIcon className="size-4 text-zinc-500"/>
                <h3 className="text-slate-900 text-sm">Published</h3>
                <span className="ml-auto text-xs font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">{published.length}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {published.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">No published posts yet </div>
                ) : (
                  published.map((post)=>(
                    <div key={post._id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-1.5 items-center">
                            {post.platforms.map((pl: string)=>{
                              const meta = PLATFORMS.find((p)=> p.id === pl);
                              return meta ? <meta.icon key={pl} className="size-3.5 text-slate-400"/> : null
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            {post.mediaType && <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md font-semibold capitalize">{post.mediaType}</span>}

                            <span className="text-xs text-slate-400">{new Date(post.updatedAt).toLocaleString()}</span>
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
  )
}

export default Scheduler
>>>>>>> 70268fad140b4ac606f76666c42810099aaf6e9e
